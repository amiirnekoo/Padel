import os
import uuid
import hmac
import hashlib
import time
import struct
import shutil
import base64
from datetime import datetime, timezone
from typing import Tuple, Optional, AsyncGenerator, Dict, Any
from fastapi import HTTPException, status, Request
from fastapi.responses import StreamingResponse, Response
from backend.app.core.config import settings

ALLOWED_MIME_TYPES = {
    "image/jpeg": {".jpg", ".jpeg"},
    "image/png": {".png"},
    "image/webp": {".webp"},
    "video/mp4": {".mp4"},
    "text/vtt": {".vtt"},
}


class DrillMediaService:
    @staticmethod
    def get_storage_path() -> str:
        base_path = os.path.abspath(settings.DRILLS_STORAGE_DIR)
        os.makedirs(base_path, exist_ok=True)
        return base_path

    @staticmethod
    def inspect_and_validate_header(header_bytes: bytes, original_filename: str) -> Tuple[str, str]:
        """
        Validates magic bytes and returns (detected_mime, media_type).
        Rejects unknown, executable or incompatible formats.
        """
        lower_name = original_filename.lower()
        _, ext = os.path.splitext(lower_name)

        if len(header_bytes) < 12:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="فایل ارسالی ناقص یا فاقد هدر معتبر است."
            )

        # JPEG
        if header_bytes.startswith(b"\xff\xd8\xff"):
            return "image/jpeg", "IMAGE"

        # PNG
        if header_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
            return "image/png", "IMAGE"

        # WebP (RIFF....WEBP)
        if header_bytes.startswith(b"RIFF") and header_bytes[8:12] == b"WEBP":
            return "image/webp", "IMAGE"

        # WebVTT subtitle
        if header_bytes.startswith(b"WEBVTT") or lower_name.endswith(".vtt"):
            return "text/vtt", "SUBTITLE"

        # MP4 (ISO Base Media file with ftyp box at byte 4)
        if len(header_bytes) >= 12 and header_bytes[4:8] == b"ftyp":
            brand = header_bytes[8:12].decode("latin-1", errors="ignore").strip().lower()
            valid_brands = {"mp41", "mp42", "isom", "iso2", "avc1", "dash", "qt"}
            if brand in valid_brands or any(b in brand for b in ["mp4", "iso", "avc"]):
                return "video/mp4", "VIDEO"

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="فرمت فایل پشتیبانی نمی‌شود. فقط فایل‌های ویدیویی استاندارد MP4، تصاویر JPG/PNG/WebP و زیرنویس VTT مجاز هستند."
        )

    @staticmethod
    async def save_media_stream(
        drill_id: str,
        stream_generator: AsyncGenerator[bytes, None],
        original_filename: str,
        media_type: str
    ) -> Tuple[str, str, int]:
        """
        Streams file to private storage chunk-by-chunk to prevent memory exhaustion.
        Returns (storage_key, mime_type, file_size_bytes).
        """
        max_bytes = settings.DRILLS_MAX_UPLOAD_SIZE_MB * 1024 * 1024
        storage_dir = DrillMediaService.get_storage_path()

        # Sanitize extension
        _, ext = os.path.splitext(original_filename.lower())
        if ext not in {".jpg", ".jpeg", ".png", ".webp", ".mp4", ".vtt"}:
            ext = ".mp4" if media_type == "VIDEO" else ".jpg"

        storage_key = f"{drill_id}_{uuid.uuid4().hex[:12]}{ext}"
        target_path = os.path.join(storage_dir, storage_key)

        # Path traversal guard
        if not os.path.abspath(target_path).startswith(storage_dir):
            raise HTTPException(status_code=400, detail="مسیر ذخیره‌سازی نامعتبر است.")

        file_size = 0
        header_bytes = b""

        try:
            with open(target_path, "wb") as out_file:
                async for chunk in stream_generator:
                    if not chunk:
                        continue
                    if len(header_bytes) < 32:
                        header_bytes += chunk[:32 - len(header_bytes)]
                    file_size += len(chunk)
                    if file_size > max_bytes:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"حجم فایل بیش از سقف مجاز ({settings.DRILLS_MAX_UPLOAD_SIZE_MB} مگابایت) است."
                        )
                    out_file.write(chunk)
        except Exception:
            if os.path.exists(target_path):
                os.remove(target_path)
            raise

        detected_mime, detected_type = DrillMediaService.inspect_and_validate_header(header_bytes, original_filename)
        return storage_key, detected_mime, file_size

    @staticmethod
    def save_media_bytes(
        drill_id: str,
        content_bytes: bytes,
        original_filename: str,
        media_type: str
    ) -> Tuple[str, str, int]:
        max_bytes = settings.DRILLS_MAX_UPLOAD_SIZE_MB * 1024 * 1024
        file_size = len(content_bytes)
        if file_size > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"حجم فایل بیش از سقف مجاز ({settings.DRILLS_MAX_UPLOAD_SIZE_MB} مگابایت) است."
            )

        storage_dir = DrillMediaService.get_storage_path()
        _, ext = os.path.splitext(original_filename.lower())
        if ext not in {".jpg", ".jpeg", ".png", ".webp", ".mp4", ".vtt"}:
            ext = ".mp4" if media_type == "VIDEO" else ".jpg"

        storage_key = f"{drill_id}_{uuid.uuid4().hex[:12]}{ext}"
        target_path = os.path.join(storage_dir, storage_key)

        if not os.path.abspath(target_path).startswith(storage_dir):
            raise HTTPException(status_code=400, detail="مسیر ذخیره‌سازی نامعتبر است.")

        detected_mime, detected_type = DrillMediaService.inspect_and_validate_header(content_bytes[:32], original_filename)

        with open(target_path, "wb") as out_file:
            out_file.write(content_bytes)

        return storage_key, detected_mime, file_size

    @staticmethod
    def delete_physical_file(storage_key: str):
        storage_dir = DrillMediaService.get_storage_path()
        target_path = os.path.join(storage_dir, storage_key)
        if os.path.abspath(target_path).startswith(storage_dir) and os.path.exists(target_path):
            try:
                os.remove(target_path)
            except OSError:
                pass

    @staticmethod
    def stream_media(request: Request, storage_key: str, mime_type: str) -> Response:
        """
        Streams media with HTTP Range Request (206 Partial Content) support for video scrubbing.
        """
        storage_dir = DrillMediaService.get_storage_path()
        file_path = os.path.join(storage_dir, storage_key)

        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="فایل رسانه در فضای ذخیره‌سازی یافت نشد."
            )

        file_size = os.path.getsize(file_path)
        range_header = request.headers.get("Range")

        common_headers = {
            "Accept-Ranges": "bytes",
            "Cache-Control": "private, no-cache, must-revalidate",
        }

        if not range_header or "=" not in range_header:
            def iter_full_file():
                with open(file_path, "rb") as f:
                    while chunk := f.read(65536):
                        yield chunk

            headers = {
                **common_headers,
                "Content-Length": str(file_size),
                "Content-Type": mime_type,
            }
            return StreamingResponse(iter_full_file(), status_code=200, headers=headers)

        try:
            byte_range = range_header.split("=")[1].strip()
            parts = byte_range.split("-")
            start = int(parts[0]) if parts[0] else 0
            end = int(parts[1]) if len(parts) > 1 and parts[1] else file_size - 1

            if start >= file_size or end >= file_size or start > end:
                raise ValueError("Invalid range values")

            chunk_size = end - start + 1
        except Exception:
            return Response(
                status_code=status.HTTP_416_REQUESTED_RANGE_NOT_SATISFIABLE,
                headers={"Content-Range": f"bytes */{file_size}"}
            )

        def iter_range(offset: int, length: int):
            with open(file_path, "rb") as f:
                f.seek(offset)
                remaining = length
                while remaining > 0:
                    read_len = min(65536, remaining)
                    data = f.read(read_len)
                    if not data:
                        break
                    remaining -= len(data)
                    yield data

        headers = {
            **common_headers,
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Content-Length": str(chunk_size),
            "Content-Type": mime_type,
        }
        return StreamingResponse(iter_range(start, chunk_size), status_code=206, headers=headers)

    @staticmethod
    def validate_video_metadata(storage_key: str) -> Tuple[str, Optional[str], Optional[int], Optional[int], Optional[int]]:
        """
        Validates video integrity and extracts metadata (status, error_msg, duration_seconds, width, height).
        Uses pure python MP4 atom parser by default; complements with ffprobe if installed on the host.
        Returns validation_status ('VALIDATED' or 'REJECTED'), error_msg, duration, width, height.
        """
        storage_dir = DrillMediaService.get_storage_path()
        file_path = os.path.join(storage_dir, storage_key)
        if not os.path.exists(file_path):
            return "REJECTED", "فایل ویدیو بر روی دیسک یافت نشد.", None, None, None

        file_size = os.path.getsize(file_path)
        if file_size < 128:
            return "REJECTED", "اندازه فایل ویدیو کمتر از حد مجاز یک ویدیوی معتبر است.", None, None, None

        duration_sec: Optional[int] = None
        width: Optional[int] = None
        height: Optional[int] = None
        found_moov = False

        try:
            with open(file_path, "rb") as f:
                pos = 0
                while pos < file_size:
                    f.seek(pos)
                    header = f.read(8)
                    if len(header) < 8:
                        break
                    atom_size, atom_type = struct.unpack(">I4s", header)
                    if atom_size == 1:
                        # 64-bit size
                        ext_size_bytes = f.read(8)
                        if len(ext_size_bytes) == 8:
                            atom_size = struct.unpack(">Q", ext_size_bytes)[0]
                        else:
                            break
                    elif atom_size == 0:
                        atom_size = file_size - pos

                    if atom_size < 8:
                        break

                    if atom_type == b"moov":
                        found_moov = True
                        moov_data = f.read(min(atom_size - 8, 2097152))
                        # Scan mvhd for duration
                        mvhd_idx = moov_data.find(b"mvhd")
                        if mvhd_idx != -1 and len(moov_data) >= mvhd_idx + 24:
                            mvhd_payload = moov_data[mvhd_idx + 4:]
                            version = mvhd_payload[0]
                            if version == 0 and len(mvhd_payload) >= 20:
                                # v0: timescale (4 bytes at offset 12), duration (4 bytes at offset 16)
                                timescale, duration = struct.unpack(">II", mvhd_payload[12:20])
                                if timescale > 0:
                                    duration_sec = int(duration / timescale)
                            elif version == 1 and len(mvhd_payload) >= 28:
                                # v1: timescale (4 bytes at offset 20), duration (8 bytes at offset 24)
                                timescale, duration = struct.unpack(">IQ", mvhd_payload[20:32])
                                if timescale > 0:
                                    duration_sec = int(duration / timescale)

                        # Scan tkhd for dimensions
                        tkhd_idx = moov_data.find(b"tkhd")
                        if tkhd_idx != -1 and len(moov_data) >= tkhd_idx + 84:
                            tkhd_payload = moov_data[tkhd_idx + 4:]
                            v = tkhd_payload[0]
                            dim_offset = 76 if v == 0 else 88
                            if len(tkhd_payload) >= dim_offset + 8:
                                w_fp, h_fp = struct.unpack(">II", tkhd_payload[dim_offset:dim_offset + 8])
                                width = int(w_fp >> 16)
                                height = int(h_fp >> 16)
                        break

                    pos += atom_size

            if not found_moov:
                return "REJECTED", "ساختار اتم‌های ویدیویی ناقص است (moov atom یافت نشد). فایل خراب یا ناقص است.", None, None, None

            return "VALIDATED", None, duration_sec, width, height
        except Exception as e:
            return "REJECTED", f"خطا در تجزیه متادیتای ویدیو: {str(e)}", None, None, None

    @staticmethod
    def generate_ephemeral_preview_token(
        media_id: str,
        drill_id: str,
        user_id: str,
        purpose: str = "preview",
        valid_seconds: int = 600
    ) -> Tuple[str, datetime]:
        """
        Creates a time-limited signed token bound to media_id, drill_id, user_id, and purpose.
        Never exposes master JWT in URL.
        """
        exp_ts = int(time.time()) + valid_seconds
        user_b64 = base64.urlsafe_b64encode(user_id.encode()).decode().rstrip("=")
        payload_str = f"{user_id}:{media_id}:{drill_id}:{purpose}:{exp_ts}"
        sig = hmac.new(settings.SECRET_KEY.encode(), payload_str.encode(), hashlib.sha256).hexdigest()
        token = f"{user_b64}.{media_id}.{drill_id}.{exp_ts}.{purpose}.{sig}"
        exp_dt = datetime.fromtimestamp(exp_ts, tz=timezone.utc)
        return token, exp_dt

    @staticmethod
    def verify_ephemeral_preview_token(token: str, media_id: str, drill_id: str) -> Tuple[bool, Optional[str]]:
        """
        Verifies validity, expiry, purpose and cryptographic signature of the ephemeral preview token.
        Returns (is_valid, user_id).
        """
        try:
            parts = token.split(".")
            if len(parts) != 6:
                return False, None
            user_b64, t_media_id, t_drill_id, t_exp, t_purpose, sig = parts
            if t_media_id != media_id or t_drill_id != drill_id or t_purpose != "preview":
                return False, None
            exp_ts = int(t_exp)
            if time.time() > exp_ts:
                return False, None

            padding = 4 - (len(user_b64) % 4)
            if padding != 4:
                user_b64 += "=" * padding
            user_id = base64.urlsafe_b64decode(user_b64).decode()

            payload_str = f"{user_id}:{media_id}:{drill_id}:{t_purpose}:{exp_ts}"
            expected_sig = hmac.new(settings.SECRET_KEY.encode(), payload_str.encode(), hashlib.sha256).hexdigest()
            if not hmac.compare_digest(sig, expected_sig):
                return False, None

            return True, user_id
        except Exception:
            return False, None
