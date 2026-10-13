from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from backend.app.services.shop_service import ShopService

class RacketQuizInput(BaseModel):
    player_level: str = Field(..., description="سطح بازی: BEGINNER, INTERMEDIATE, ADVANCED, PRO")
    playstyle: str = Field(..., description="سبک بازی: DEFENSIVE_CONTROL, ALL_ROUND_BALANCED, AGGRESSIVE_ATTACK")
    physical_priority: str = Field("BALANCED", description="اولویت ارگونومیک: ARM_COMFORT, MAX_POWER, BALANCED")
    budget_tier: str = Field("ANY", description="بازه بودجه: ANY, ECONOMIC, MID_RANGE, FLAGSHIP")
    supply_preference: str = Field("ALL", description="نحوه تامین: ALL, DOMESTIC_FAST, EUROPE_ORDER")

class RacketFinderService:
    """موتور پردازش و تطابق هوشمند راکت‌های پدل بر اساس سبک بازی و مشخصات بیومکانیک"""

    @classmethod
    def recommend_rackets(cls, quiz_input: RacketQuizInput) -> Dict[str, Any]:
        all_products = ShopService.get_products()
        # فیلتر فقط راکت‌های پدل
        rackets = [p for p in all_products if p.get("category") == "PADEL_RACKET"]
        
        scored_rackets: List[Dict[str, Any]] = []

        for racket in rackets:
            score, reasons = cls._evaluate_racket(racket, quiz_input)
            racket_copy = dict(racket)
            racket_copy["match_score"] = score
            racket_copy["match_reasons"] = reasons
            racket_copy["match_title"] = cls._generate_match_title(quiz_input.playstyle, score)
            scored_rackets.append(racket_copy)

        # مرتب‌سازی بر اساس امتیاز تطابق نزولی و سپس نمره ریتینگ/سال
        scored_rackets.sort(
            key=lambda r: (r["match_score"], r.get("year", 2026), r.get("price", 0)),
            reverse=True
        )

        top_recommendation = scored_rackets[0] if scored_rackets else None
        alternatives = scored_rackets[1:4] if len(scored_rackets) > 1 else []

        return {
            "top_recommendation": top_recommendation,
            "alternatives": alternatives,
            "total_matches": len(scored_rackets),
            "quiz_summary": {
                "player_level": quiz_input.player_level,
                "playstyle": quiz_input.playstyle,
                "physical_priority": quiz_input.physical_priority,
                "budget_tier": quiz_input.budget_tier
            }
        }

    @classmethod
    def _evaluate_racket(cls, racket: Dict[str, Any], q: RacketQuizInput) -> tuple[int, List[str]]:
        score = 70  # امتیاز پایه
        reasons: List[str] = []

        shape = str(racket.get("shape", "")).lower()
        balance = str(racket.get("balance", "")).lower()
        level = str(racket.get("level", "")).upper()
        power = float(racket.get("power_index", 8.5))
        control = float(racket.get("control_index", 8.5))
        core = str(racket.get("core", "")).lower()
        surface = str(racket.get("surface", "")).lower()

        # ۱. سبک بازی و هندسه فریم
        if q.playstyle == "AGGRESSIVE_ATTACK":
            if "diamond" in shape or "الماس" in shape:
                score += 15
                reasons.append("فریم الماسی با نقطه ثقل سرسنگین جهت تقویت اهرم ضربات هجومی")
            elif "teardrop" in shape or "اشکی" in shape:
                score += 8
            if "heavy" in balance or "سرسنگین" in balance or "high" in balance:
                score += 10
                reasons.append("بالانس متمایل به سر راکت برای حداکثر سرعت دهانه در اسمش")
            if power >= 9.5:
                score += 6
                reasons.append("شاخص توان نفوذ ۹.۵+ جهت ضربات تمام‌کننده پای تور")

        elif q.playstyle == "DEFENSIVE_CONTROL":
            if "round" in shape or "گرد" in shape:
                score += 15
                reasons.append("سوئیت‌اسپات (Sweet Spot) متمرکز و بزرگ فریم گرد برای تسلط کامل")
            elif "teardrop" in shape or "اشکی" in shape:
                score += 6
            if "low" in balance or "پایین" in balance or "خوش‌دست" in balance:
                score += 10
                reasons.append("بالانس پایین برای مانورپذیری چابک در دفاع گوشه‌های شیشه")
            if control >= 9.5:
                score += 6
                reasons.append("ضریب کنترل و نقطه‌زنی حداکثری در ضربات دفاعی و لوپ")

        else:  # ALL_ROUND_BALANCED
            if "teardrop" in shape or "اشکی" in shape or "قطره" in shape:
                score += 15
                reasons.append("فریم اشکی هیبریدی با توازن ارگونومیک میان ضربات دفاع و حمله")
            elif "round" in shape or "گرد" in shape:
                score += 8
            if "even" in balance or "متعادل" in balance:
                score += 10
                reasons.append("بالانس توزیع‌شده داینامیک برای تطبیق‌پذیری در بازی تیمی")
            if power >= 9.0 and control >= 9.0:
                score += 6
                reasons.append("تعادل مهندسی‌شده با امتیاز هم‌زمان توان و دقت بالا")

        # ۲. اولویت فیزیکی و محافظت از مچ و آرنج
        if q.physical_priority == "ARM_COMFORT":
            if "round" in shape or "گرد" in shape or "hr3" in core or "soft" in core or "فایبرگلاس" in surface:
                score += 12
                reasons.append("جذب لرزش و پاسخدهی الاستیک جهت حفاظت از تاندون‌های آرنج و مچ")
            if "diamond" in shape or "الماس" in shape or "heavy" in balance:
                score -= 10
        elif q.physical_priority == "MAX_POWER":
            if "18k" in surface or "12k" in surface or "diamond" in shape or power >= 9.5:
                score += 8
                reasons.append("سطح کربن پرچگال جهت بازگشت آنی انرژی ضربه به توپ")

        # ۳. سطح بازیکن
        if q.player_level in ["PRO", "ADVANCED"] and level in ["PRO", "ADVANCED"]:
            score += 5
        elif q.player_level == "BEGINNER":
            if "round" in shape or "گرد" in shape or "low" in balance:
                score += 8
                reasons.append("سهولت کنترل و عدم نیاز به قلق‌گیری سخت برای تسریع روند یادگیری")

        # ۴. جدیدترین سال کاتالوگ (خط قرمز ۱۱)
        if racket.get("year") == 2027 or racket.get("is_new"):
            score += 3
            reasons.append("جدیدترین فناوری کلکسیون سال با به‌روزرسانی‌های شاسی و گریپ")

        # محدودسازی سقف امتیاز به ۹۹ و کف به ۷۵
        final_score = max(75, min(99, score))
        return final_score, reasons[:3]

    @staticmethod
    def _generate_match_title(playstyle: str, score: int) -> str:
        if playstyle == "AGGRESSIVE_ATTACK":
            return f"سلاح برتر هجومی با تطابق {score}٪"
        elif playstyle == "DEFENSIVE_CONTROL":
            return f"راکت آرمانی کنترلی با تطابق {score}٪"
        return f"انتخاب مهندسی متعادل با تطابق {score}٪"
