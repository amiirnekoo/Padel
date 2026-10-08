import uuid
import logging
from abc import ABC, abstractmethod
from typing import Any
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class SmsResult(BaseModel):
    success: bool
    message_id: str | None = None
    provider: str
    recipient: str
    error: str | None = None

class BaseSmsProvider(ABC):
    @abstractmethod
    async def send_pattern_sms(
        self,
        receptor: str,
        template: str,
        tokens: dict[str, str]
    ) -> SmsResult:
        """Sends a pattern/template based SMS that bypasses telecommunication blacklists."""
        pass

    @abstractmethod
    async def send_sms(
        self,
        receptor: str,
        message: str
    ) -> SmsResult:
        """Sends a standard text SMS."""
        pass


class MockSmsProvider(BaseSmsProvider):
    """
    High-fidelity Sandbox/Mock provider for local testing and CI/CD.
    Simulates successful telecommunication delivery without incurring real SMS costs.
    """
    async def send_pattern_sms(
        self,
        receptor: str,
        template: str,
        tokens: dict[str, str]
    ) -> SmsResult:
        simulated_id = f"MOCK-SMS-{uuid.uuid4().hex[:8].upper()}"
        logger.info(f"[SMS SANDBOX] Dispatched to {receptor} | Template: {template} | Tokens: {tokens} | ID: {simulated_id}")
        return SmsResult(
            success=True,
            message_id=simulated_id,
            provider="mock",
            recipient=receptor
        )

    async def send_sms(
        self,
        receptor: str,
        message: str
    ) -> SmsResult:
        simulated_id = f"MOCK-SMS-{uuid.uuid4().hex[:8].upper()}"
        logger.info(f"[SMS SANDBOX DIRECT] Dispatched to {receptor} | Message: {message[:30]}... | ID: {simulated_id}")
        return SmsResult(
            success=True,
            message_id=simulated_id,
            provider="mock",
            recipient=receptor
        )


class KavenegarSmsProvider(BaseSmsProvider):
    """Kavenegar Pattern-Based SMS Provider (Lookup API) & Direct SMS."""
    def __init__(self, api_key: str | None = None):
        if not api_key:
            try:
                from backend.app.core.config import settings
                api_key = settings.KAVENEGAR_API_KEY
            except Exception:
                api_key = "KAVENEGAR_DEFAULT_APIKEY"
        self.api_key = api_key or "KAVENEGAR_DEFAULT_APIKEY"

    async def send_pattern_sms(
        self,
        receptor: str,
        template: str,
        tokens: dict[str, str]
    ) -> SmsResult:
        try:
            import httpx
            url = f"https://api.kavenegar.com/v1/{self.api_key}/verify/lookup.json"
            
            # Map semantic tokens to Kavenegar verify lookup parameters
            token1 = tokens.get("token") or tokens.get("tracking") or tokens.get("code") or tokens.get("refund")
            token2 = tokens.get("token2") or tokens.get("club") or tokens.get("court")
            token3 = tokens.get("token3") or tokens.get("time") or tokens.get("date") or tokens.get("balance")

            if not token1 and tokens:
                vals = [str(v) for v in tokens.values() if v is not None]
                if vals:
                    token1 = vals[0]
                if not token2 and len(vals) > 1:
                    token2 = vals[1]
                if not token3 and len(vals) > 2:
                    token3 = vals[2]

            params: dict[str, str] = {
                "receptor": receptor,
                "template": template,
                "token": str(token1 or "").replace(" ", "-"),
            }
            if token2:
                params["token2"] = str(token2).replace(" ", "-")
            if token3:
                params["token3"] = str(token3).replace(" ", "-")
            if "token10" in tokens:
                params["token10"] = str(tokens["token10"]).replace(" ", "-")
            if "token20" in tokens:
                params["token20"] = str(tokens["token20"]).replace(" ", "-")

            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(url, params=params)
                if res.status_code == 200:
                    data = res.json()
                    msg_id = str(data.get("entries", [{}])[0].get("messageid", "KVN-OK"))
                    return SmsResult(success=True, message_id=msg_id, provider="kavenegar", recipient=receptor)

                # Fallback to direct SMS if template is not registered or approved yet
                token_val = params.get("token", "")
                if "otp" in template.lower():
                    direct_msg = f"کد تأیید ورود شما به سامانه رالی: {token_val}"
                else:
                    direct_msg = f"اطلاع‌رسانی سامانه رالی: {token_val}"
                direct_res = await self.send_sms(receptor, direct_msg)
                if direct_res.success:
                    return direct_res
                return SmsResult(success=False, provider="kavenegar", recipient=receptor, error=res.text)
        except Exception as e:
            logger.error(f"Kavenegar SMS dispatch failed: {e}")
            return SmsResult(success=False, provider="kavenegar", recipient=receptor, error=str(e))

    async def send_sms(
        self,
        receptor: str,
        message: str
    ) -> SmsResult:
        try:
            import httpx
            url = f"https://api.kavenegar.com/v1/{self.api_key}/sms/send.json"
            params = {
                "receptor": receptor,
                "message": message,
            }
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(url, params=params)
                if res.status_code == 200:
                    data = res.json()
                    msg_id = str(data.get("entries", [{}])[0].get("messageid", "KVN-OK"))
                    return SmsResult(success=True, message_id=msg_id, provider="kavenegar", recipient=receptor)
                return SmsResult(success=False, provider="kavenegar", recipient=receptor, error=res.text)
        except Exception as e:
            logger.error(f"Kavenegar direct SMS send failed: {e}")
            return SmsResult(success=False, provider="kavenegar", recipient=receptor, error=str(e))


class FarazSmsProvider(BaseSmsProvider):
    """FarazSMS / IPPanel Pattern Provider."""
    def __init__(self, api_key: str | None = None, sender: str = "+983000505"):
        self.api_key = api_key or "FARAZ_DEFAULT_KEY"
        self.sender = sender

    async def send_pattern_sms(
        self,
        receptor: str,
        template: str,
        tokens: dict[str, str]
    ) -> SmsResult:
        try:
            import httpx
            url = "https://ippanel.com/api/select"
            payload = {
                "op": "pattern",
                "user": self.api_key,
                "pass": "SECRET",
                "fromNum": self.sender,
                "toNum": receptor,
                "patternCode": template,
                "inputData": [tokens]
            }
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    return SmsResult(success=True, message_id="FRZ-OK", provider="farazsms", recipient=receptor)
                return SmsResult(success=False, provider="farazsms", recipient=receptor, error=res.text)
        except Exception as e:
            logger.error(f"FarazSMS dispatch failed: {e}")
            return SmsResult(success=False, provider="farazsms", recipient=receptor, error=str(e))

    async def send_sms(
        self,
        receptor: str,
        message: str
    ) -> SmsResult:
        try:
            import httpx
            url = "https://ippanel.com/api/select"
            payload = {
                "op": "send",
                "user": self.api_key,
                "pass": "SECRET",
                "fromNum": self.sender,
                "toNum": receptor,
                "message": message
            }
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    return SmsResult(success=True, message_id="FRZ-OK", provider="farazsms", recipient=receptor)
                return SmsResult(success=False, provider="farazsms", recipient=receptor, error=res.text)
        except Exception as e:
            logger.error(f"FarazSMS direct send failed: {e}")
            return SmsResult(success=False, provider="farazsms", recipient=receptor, error=str(e))


class DisabledSmsProvider(BaseSmsProvider):
    """Explicitly fails and warns when SMS provider is unconfigured or mock in production."""
    async def send_pattern_sms(
        self,
        receptor: str,
        template: str,
        tokens: dict
    ) -> SmsResult:
        logger.warning(f"[SMS DISABLED] SMS provider is unconfigured or disabled in production for {receptor}")
        return SmsResult(
            success=False,
            provider="disabled",
            recipient=receptor,
            error="سرویس ارسال پیامک در محیط عملیاتی پیکربندی نشده است"
        )

    async def send_sms(
        self,
        receptor: str,
        message: str
    ) -> SmsResult:
        logger.warning(f"[SMS DISABLED] Direct SMS provider is unconfigured or disabled in production for {receptor}")
        return SmsResult(
            success=False,
            provider="disabled",
            recipient=receptor,
            error="سرویس ارسال پیامک در محیط عملیاتی پیکربندی نشده است"
        )


def get_sms_provider(provider_type: str = "mock", is_production: bool = False) -> BaseSmsProvider:
    from backend.app.core.config import settings
    provider = provider_type.lower().strip()
    if is_production and provider in ["mock", "simulator", "none", ""]:
        return DisabledSmsProvider()
    if provider == "kavenegar":
        return KavenegarSmsProvider(api_key=settings.KAVENEGAR_API_KEY)
    if provider == "farazsms":
        return FarazSmsProvider()
    if is_production:
        return DisabledSmsProvider()
    return MockSmsProvider()

