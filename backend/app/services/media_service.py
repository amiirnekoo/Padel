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

    @staticmethod
    def process_product_responsive_images(
        content_bytes: bytes,
        product_slug: str,
        image_name: str = "1"
    ) -> Dict[str, Any]:
        """
        پردازش فوق‌حرفه‌ای تصویر ورودی و ساخت خودکار ابعاد رسپانسیو:
        - نسخه دسکتاپ رتینا (Desktop HD) - 1200x1200px
        - نسخه تبلت (Tablet) - 800x800px
        - نسخه موبایل (Mobile) - 480x480px
        - نسخه بندانگشتی (Thumbnail) - 200x200px
        تمام نسخه‌ها در فرمت مدرن و سبک WebP با نهایت شارپنس (Lanczos) فشرده و ذخیره می‌شوند.
        """
        import io
        import re
        from PIL import Image, ImageOps

        # پاکسازی نام پوشه و فایل
        clean_slug = re.sub(r'[^a-zA-Z0-9_\-]', '', product_slug.lower()) or "product"
        clean_name = re.sub(r'[^a-zA-Z0-9_\-]', '', str(image_name).lower()) or "img"

        target_dir = os.path.join(MediaService.get_upload_path(), "products", clean_slug)
        os.makedirs(target_dir, exist_ok=True)

        try:
            raw_image = Image.open(io.BytesIO(content_bytes))
            # تصحیح جهت دوربین گوشی
            raw_image = ImageOps.exif_transpose(raw_image)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"فایل ارسال‌شده تصویر معتبر نمی‌باشد: {str(e)}")

        orig_w, orig_h = raw_image.size

        # ابعاد هدف
        size_configs = {
            "desktop": (1200, 1200, 88),
            "tablet": (800, 800, 85),
            "mobile": (480, 480, 82),
            "thumbnail": (200, 200, 80)
        }

        generated_urls = {}
        metadata_sizes = {}

        # تبدیل به RGBA یا RGB مناسب برای WebP
        if raw_image.mode not in ("RGB", "RGBA"):
            base_img = raw_image.convert("RGBA" if "transparency" in raw_image.info or raw_image.mode == "P" else "RGB")
        else:
            base_img = raw_image

        for variant_key, (max_w, max_h, quality) in size_configs.items():
            img_copy = base_img.copy()
            # حفظ نسبت تصویر و اندازه متناسب
            img_copy.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
            
            suffix = "thumb" if variant_key == "thumbnail" else variant_key
            file_name = f"{clean_name}_{suffix}.webp"
            file_path = os.path.join(target_dir, file_name)

            # ذخیره با فشرده‌سازی WebP باکیفیت و بدون افت
            img_copy.save(file_path, "WEBP", quality=quality, method=6)

            public_url = f"/uploads/products/{clean_slug}/{file_name}"
            generated_urls[variant_key] = public_url
            metadata_sizes[variant_key] = {
                "width": img_copy.width,
                "height": img_copy.height,
                "url": public_url
            }

        # URL نسخه اصلی به عنوان نسخه پیش‌فرض
        primary_url = generated_urls.get("desktop", generated_urls.get("mobile"))

        return {
            "primary_url": primary_url,
            "desktop": generated_urls["desktop"],
            "tablet": generated_urls["tablet"],
            "mobile": generated_urls["mobile"],
            "thumbnail": generated_urls["thumbnail"],
            "metadata": {
                "original_size": [orig_w, orig_h],
                "slug": clean_slug,
                "sizes": metadata_sizes
            }
        }

