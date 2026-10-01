import os
import uuid
import base64
from typing import List, Optional, Dict, Any
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from backend.app.core.config import settings
from backend.app.models.content import MediaAsset

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}
ALLOWED_FOLDERS = {"products", "banners", "articles", "courts", "general"}


class MediaService:
    @staticmethod
    def get_upload_path() -> str:
        upload_path = os.path.abspath(settings.UPLOAD_DIR)
        os.makedirs(upload_path, exist_ok=True)
        return upload_path

    @staticmethod
    async def save_upload_bytes(
        db: AsyncSession,
        file_name: str,
        content_bytes: bytes,
        mime_type: str = "image/jpeg",
        folder: str = "general",
        uploaded_by: str = "admin"
    ) -> Dict[str, Any]:
        if folder not in ALLOWED_FOLDERS:
            folder = "general"

        file_size = len(content_bytes)
        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if file_size > max_bytes:
            raise HTTPException(
                status_code=400,
                detail=f"حجم فایل بیش از سقف مجاز ({settings.MAX_UPLOAD_SIZE_MB} مگابایت) است."
            )

        _, ext = os.path.splitext(file_name.lower())
        if ext not in ALLOWED_EXTENSIONS:
            ext = ".jpg"

        unique_name = f"{uuid.uuid4().hex[:12]}{ext}"
        folder_dir = os.path.join(MediaService.get_upload_path(), folder)
        os.makedirs(folder_dir, exist_ok=True)

        full_file_path = os.path.join(folder_dir, unique_name)
        with open(full_file_path, "wb") as f:
            f.write(content_bytes)

        public_url = f"/uploads/{folder}/{unique_name}"

        asset = MediaAsset(
            file_name=file_name,
            file_path=public_url,
            file_size=file_size,
            mime_type=mime_type,
            folder=folder,
            uploaded_by=uploaded_by
        )
        db.add(asset)
        await db.commit()
        await db.refresh(asset)

        return {
            "id": asset.id,
            "file_name": asset.file_name,
            "url": asset.file_path,
            "size": asset.file_size,
            "folder": asset.folder,
            "mime_type": asset.mime_type,
            "created_at": asset.created_at.isoformat()
        }

    @staticmethod
    async def list_media(
        db: AsyncSession,
        folder: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        query = select(MediaAsset).order_by(desc(MediaAsset.created_at))
        if folder:
            query = query.where(MediaAsset.folder == folder)
        query = query.offset(offset).limit(limit)

        result = await db.execute(query)
        assets = result.scalars().all()

        return [
            {
                "id": a.id,
                "file_name": a.file_name,
                "url": a.file_path,
                "size": a.file_size,
                "folder": a.folder,
                "mime_type": a.mime_type,
                "uploaded_by": a.uploaded_by,
                "created_at": a.created_at.isoformat()
            }
            for a in assets
        ]

    @staticmethod
    async def delete_media(db: AsyncSession, asset_id: str) -> bool:
        asset = await db.get(MediaAsset, asset_id)
        if not asset:
            return False

        try:
            rel_path = asset.file_path.replace("/uploads/", "")
            local_path = os.path.join(MediaService.get_upload_path(), rel_path)
            if os.path.exists(local_path):
                os.remove(local_path)
        except Exception:
            pass

        await db.delete(asset)
        await db.commit()
        return True
