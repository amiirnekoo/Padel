import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.services.racket_finder_service import RacketFinderService, RacketQuizInput

@pytest.mark.asyncio
async def test_racket_finder_aggressive_recommendation():
    """تست پیشنهاد راکت تهاجمی با فریم الماسی و توان ضربه بالا"""
    payload = RacketQuizInput(
        player_level="PRO",
        playstyle="AGGRESSIVE_ATTACK",
        physical_priority="MAX_POWER",
        budget_tier="ANY",
        supply_preference="ALL"
    )
    result = RacketFinderService.recommend_rackets(payload)
    
    assert "top_recommendation" in result
    assert "alternatives" in result
    top_racket = result["top_recommendation"]
    
    # باید راکت پدل باشد
    assert top_racket["category"] == "PADEL_RACKET"
    # درصد تطابق باید بالا باشد
    assert top_racket["match_score"] >= 85
    # باید فریم الماسی یا مشخصه سرسنگین داشته باشد
    assert any(term in top_racket["shape"].lower() or term in top_racket["balance"].lower() for term in ["diamond", "الماس", "heavy", "سرسنگین"])
    # دلایل پیشنهاد باید ثبت شده باشند
    assert len(top_racket["match_reasons"]) >= 2

@pytest.mark.asyncio
async def test_racket_finder_defensive_comfort_recommendation():
    """تست پیشنهاد راکت کنترلی و ضدلرزش آرنج برای سبک دفاعی"""
    payload = RacketQuizInput(
        player_level="INTERMEDIATE",
        playstyle="DEFENSIVE_CONTROL",
        physical_priority="ARM_COMFORT",
        budget_tier="ANY",
        supply_preference="ALL"
    )
    result = RacketFinderService.recommend_rackets(payload)
    top_racket = result["top_recommendation"]
    
    assert top_racket["match_score"] >= 85
    # راکت پیشنهادی کنترلی معمولا فریم گرد یا بالانس متعادل/پایین دارد
    assert any(term in top_racket["shape"].lower() or term in top_racket["balance"].lower() for term in ["round", "گرد", "low", "پایین", "متعادل"])
    assert "سلامت" in str(top_racket["match_reasons"]) or "کنترل" in str(top_racket["match_reasons"]) or "لرزش" in str(top_racket["match_reasons"])

@pytest.mark.asyncio
async def test_racket_finder_api_endpoint():
    """تست اندپوینت رسمی API راکت‌سنج رالی"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/shop/racket-finder/recommend",
            json={
                "player_level": "ADVANCED",
                "playstyle": "ALL_ROUND_BALANCED",
                "physical_priority": "BALANCED",
                "budget_tier": "ANY",
                "supply_preference": "ALL"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "top_recommendation" in data
        assert "alternatives" in data
        assert len(data["alternatives"]) >= 1
        assert "quiz_summary" in data
