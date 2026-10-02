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


class KavenegarSmsProvider(BaseSmsProvider):
    """Kavenegar Pattern-Based SMS Provider (Lookup API)."""
    def __init__(self, api_key: str | None = None):
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
            params = {
                "receptor": receptor,
                "template": template,
                "token": tokens.get("token", ""),
                "token2": tokens.get("token2", ""),
                "token3": tokens.get("token3", "")
            }
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(url, params=params)
                if res.status_code == 200:
                    data = res.json()
                    msg_id = str(data.get("entries", [{}])[0].get("messageid", "KVN-OK"))
                    return SmsResult(success=True, message_id=msg_id, provider="kavenegar", recipient=receptor)
                return SmsResult(success=False, provider="kavenegar", recipient=receptor, error=res.text)
        except Exception as e:
            logger.error(f"Kavenegar SMS dispatch failed: {e}")
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


def get_sms_provider(provider_type: str = "mock", is_production: bool = False) -> BaseSmsProvider:
    provider = provider_type.lower().strip()
    if is_production and provider in ["mock", "simulator", "none", ""]:
        return DisabledSmsProvider()
    if provider == "kavenegar":
        return KavenegarSmsProvider()
    if provider == "farazsms":
        return FarazSmsProvider()
    if is_production:
        return DisabledSmsProvider()
    return MockSmsProvider()

