import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.main import app
from backend.app.models.base import get_db_session
from backend.app.core.security import create_access_token


@pytest.mark.asyncio
async def test_admin_product_and_order_management_api(db_session: AsyncSession):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db_session] = override_get_db

    # Create admin auth token
    token = create_access_token(subject="superadmin", role="SUPER_ADMIN")
    headers = {"Authorization": f"Bearer {token}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Create a Category
        cat_res = await ac.post("/api/v1/admin/categories", json={
            "id": "cat-test-rackets",
            "name": "راکت‌های تستی",
            "slug": "test-rackets",
            "display_order": 1
        }, headers=headers)
        assert cat_res.status_code == 201

        # 2. Create a Product
        prod_payload = {
            "id": "prod-test-bullpadel",
            "title_fa": "راکت پدل بول‌پدل تستی",
            "title_en": "Bullpadel Test Racket",
            "category_id": "cat-test-rackets",
            "brand": "Bullpadel",
            "model_year": 2026,
            "sport": "PADEL",
            "level": "PRO",
            "original_price": 20000000,
            "discount_percent": 10,
            "price": 18000000,
            "stock": 5,
            "primary_image": "/images/test.jpg",
            "description_fa": "توضیحات تست راکت بول پدل"
        }
        create_res = await ac.post("/api/v1/admin/products", json=prod_payload, headers=headers)
        assert create_res.status_code == 201
        assert create_res.json()["status"] == "CREATED"

        # 3. List Products
        list_res = await ac.get("/api/v1/admin/products", headers=headers)
        assert list_res.status_code == 200
        prods = list_res.json()
        assert len(prods) >= 1
        assert any(p["id"] == "prod-test-bullpadel" for p in prods)

        # 4. Quick Stock Update
        stock_res = await ac.patch(
            "/api/v1/admin/products/prod-test-bullpadel/stock",
            json={"stock": 12},
            headers=headers
        )
        assert stock_res.status_code == 200
        assert stock_res.json()["stock"] == 12

        # 5. Media Upload via Base64
        media_res = await ac.post("/api/v1/admin/media/upload", json={
            "file_name": "test_racket.png",
            "content_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            "folder": "products"
        }, headers=headers)
        assert media_res.status_code == 200
        media_data = media_res.json()
        assert "url" in media_data
        assert media_data["folder"] == "products"

        # 6. Delete Media
        del_media = await ac.delete(f"/api/v1/admin/media/{media_data['id']}", headers=headers)
        assert del_media.status_code == 200
        assert del_media.json()["status"] == "DELETED"

        # 7. Check Dashboard Stats
        stats_res = await ac.get("/api/v1/admin/stats", headers=headers)
        assert stats_res.status_code == 200
        stats = stats_res.json()
        assert "total_products" in stats
        assert stats["total_products"] >= 1
