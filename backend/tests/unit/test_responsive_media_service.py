import io
from PIL import Image
from backend.app.services.media_service import MediaService


def create_dummy_image_bytes(width: int = 1600, height: int = 1600, color: tuple = (255, 0, 0)) -> bytes:
    """ایجاد یک بایت تصویر آزمایشی با رزولوشن بالا برای سنجش پردازش رسپانسیو"""
    img = Image.new("RGB", (width, height), color)
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG", quality=90)
    return buffer.getvalue()


def test_process_product_responsive_images_creates_all_sizes():
    """بررسی اینکه سیستم ابعاد استاندارد دسکتاپ، تبلت، موبایل و تامبنیل را در فرمت WebP تولید کند"""
    dummy_bytes = create_dummy_image_bytes(width=2000, height=2000)
    
    variants = MediaService.process_product_responsive_images(
        content_bytes=dummy_bytes,
        product_slug="test-nox-racket",
        image_name="cover"
    )
    
    assert "desktop" in variants
    assert "tablet" in variants
    assert "mobile" in variants
    assert "thumbnail" in variants
    assert "primary_url" in variants
    
    # اطمینان از فرمت WebP
    assert variants["desktop"].endswith(".webp")
    assert variants["tablet"].endswith(".webp")
    assert variants["mobile"].endswith(".webp")
    assert variants["thumbnail"].endswith(".webp")
    
    # بررسی متادیتا و ابعاد
    meta = variants.get("metadata", {})
    assert "original_size" in meta
    assert meta["original_size"] == [2000, 2000]
    
    sizes = meta.get("sizes", {})
    assert sizes["desktop"]["width"] <= 1200
    assert sizes["tablet"]["width"] <= 800
    assert sizes["mobile"]["width"] <= 480
    assert sizes["thumbnail"]["width"] <= 200


def test_process_product_responsive_images_portrait_aspect_ratio():
    """تست حفظ نسبت ابعاد عمودی برای تصاویر قدی راکت و کفش"""
    dummy_bytes = create_dummy_image_bytes(width=1000, height=2000)
    variants = MediaService.process_product_responsive_images(
        content_bytes=dummy_bytes,
        product_slug="portrait-racket",
        image_name="front"
    )
    sizes = variants["metadata"]["sizes"]
    # تصویر عمودی باید نسبت ۲:۱ را حفظ کند
    assert sizes["desktop"]["height"] > sizes["desktop"]["width"]
    assert sizes["mobile"]["height"] > sizes["mobile"]["width"]

