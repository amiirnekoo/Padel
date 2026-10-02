import random
from datetime import datetime, timedelta
from typing import Dict, Tuple
from backend.app.core.datetime_utils import utc_now

# In-memory OTP storage for development & pilot: phone_number -> (code, expires_at)
_otp_store: Dict[str, Tuple[str, datetime]] = {}

class OTPService:
    @staticmethod
    def generate_otp(phone_number: str) -> str:
        # Standard 5-digit numeric OTP
        code = str(random.randint(10000, 99999))
        expires_at = utc_now() + timedelta(minutes=2)
        _otp_store[phone_number] = (code, expires_at)
        return code

    @staticmethod
    def verify_otp(phone_number: str, code: str) -> bool:
        record = _otp_store.get(phone_number)
        if not record:
            return False
        stored_code, expires_at = record
        if utc_now() > expires_at:
            _otp_store.pop(phone_number, None)
            return False
        if stored_code == code:
            _otp_store.pop(phone_number, None)
            return True
        return False
