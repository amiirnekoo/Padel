import pytest
from backend.app.models.club import Club
from backend.app.services.admin_service import AdminService

@pytest.mark.asyncio
async def test_club_model_stores_and_updates_coordinates(db_session):
    """
    بررسی اینکه مدل باشگاه در دیتابیس می‌تواند مختصات جغرافیایی (latitude و longitude)
    را ذخیره کرده و این اطلاعات به صورت اعشاری دقیق قابل بازیابی و ویرایش است.
    """
    # 1. ایجاد باشگاه با موقعیت اولیه
    club = Club(
        id="club-test-geo-1",
        name="مجموعه پدل تست موقعیت",
        city="تهران",
        address="تهران، خیابان نیاوران",
        phone="02122334455",
        latitude=35.8210,
        longitude=51.4720
    )
    db_session.add(club)
    await db_session.commit()

    # 2. واکشی باشگاه و بررسی مختصات
    fetched = await db_session.get(Club, "club-test-geo-1")
    assert fetched is not None
    assert float(fetched.latitude) == pytest.approx(35.8210, abs=1e-4)
    assert float(fetched.longitude) == pytest.approx(51.4720, abs=1e-4)

    # 3. ویرایش موقعیت مکانی (مثلاً جابجایی توسط ادمین به کورت انقلاب)
    fetched.latitude = 35.7772
    fetched.longitude = 51.4053
    fetched.address = "تهران، اتوبان نیایش، مجموعه انقلاب"
    await db_session.commit()

    updated = await db_session.get(Club, "club-test-geo-1")
    assert float(updated.latitude) == pytest.approx(35.7772, abs=1e-4)
    assert float(updated.longitude) == pytest.approx(51.4053, abs=1e-4)
    assert "مجموعه انقلاب" in updated.address
