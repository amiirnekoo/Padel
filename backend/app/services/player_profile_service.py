from typing import Dict, Any, List, Optional
from sqlalchemy import select, desc, func
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.user import User
from backend.app.models.matchmaking import MatchmakingGame, MatchResult
from backend.app.models.club import Club, Court
from backend.app.services.elo_service import EloRatingService

class PlayerProfileService:

    @classmethod
    async def get_player_profile(cls, db: AsyncSession, user_id: str) -> Dict[str, Any]:
        """
        استخراج شناسنامه کامل بازیکن پدل، رتبه کشوری، نشان‌های افتخار و لاگ مسابقات رسمی.
        """
        stmt = select(User).where(User.id == user_id)
        res = await db.execute(stmt)
        user = res.scalar_one_or_none()
        if not user:
            raise ValueError(f"کاربر با شناسه {user_id} یافت نشد")

        played = user.matches_played or 0
        won = user.matches_won or 0
        win_rate = round((won / played) * 100, 1) if played > 0 else 0.0
        elo = user.elo_rating or 1200
        tier = EloRatingService.get_skill_tier(elo)

        # محاسبه رتبه کشوری در میان کاربران فعال
        rank_stmt = select(func.count(User.id)).where(User.is_active == True, User.elo_rating > elo)
        rank_res = await db.execute(rank_stmt)
        rank_higher = rank_res.scalar_one() or 0
        platform_rank = rank_higher + 1

        # استخراج نشان‌ها و افتخارات ورزشی (Badges)
        badges = cls._calculate_badges(user, elo, tier, played, won, win_rate)

        # استخراج لاگ مسابقات اخیر دابلز (Recent Matches)
        recent_matches = await cls._get_recent_matches(db, user_id)

        # شماره تماس مخفی‌شده برای امنیت (مثلاً 0912***4567)
        masked_phone = None
        if user.phone_number and len(user.phone_number) >= 8:
            masked_phone = f"{user.phone_number[:4]}***{user.phone_number[-4:]}"

        return {
            "id": user.id,
            "full_name": user.full_name or f"ورزشکار {user.phone_number[-4:]}",
            "phone_masked": masked_phone,
            "city": user.city or "تهران",
            "province": user.province or "تهران",
            "preferred_sport": user.preferred_sport or "PADEL",
            "dominant_hand": user.dominant_hand or "RIGHT",
            "preferred_side": user.preferred_side or "BOTH",
            "racket_name": user.racket_name or "NOX AT10 Genius 18K",
            "elo_rating": elo,
            "skill_tier": tier,
            "rank": platform_rank,
            "matches_played": played,
            "matches_won": won,
            "matches_lost": max(0, played - won),
            "win_rate": win_rate,
            "kyc_status": user.kyc_status,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "badges": badges,
            "recent_matches": recent_matches
        }

    @classmethod
    def _calculate_badges(
        cls,
        user: User,
        elo: int,
        tier: str,
        played: int,
        won: int,
        win_rate: float
    ) -> List[Dict[str, str]]:
        badges = []

        if elo >= 1000:
            badges.append({
                "id": "club_1000",
                "title": "باشگاه ۴ رقمی‌ها",
                "desc": "عبور از مرز ریتینگ ۱۰۰۰ Elo پدل",
                "icon": "Zap"
            })

        if played >= 10:
            badges.append({
                "id": "veteran",
                "title": "وفادار به کورت",
                "desc": "حضور در بیش از ۱۰ مسابقه رسمی",
                "icon": "Shield"
            })
        elif played >= 3:
            badges.append({
                "id": "warrior",
                "title": "جنگجوی پدل",
                "desc": "ثبت حداقل ۳ مسابقه رسمی در رالی",
                "icon": "Award"
            })

        if played >= 5 and win_rate >= 70.0:
            badges.append({
                "id": "high_win_rate",
                "title": "ماشین پیروزی",
                "desc": "نرخ برد درخشان بالای ۷۰ درصد",
                "icon": "Trophy"
            })

        if tier.startswith("A") or tier.startswith("B"):
            badges.append({
                "id": "master_tier",
                "title": "کلاس مسترز",
                "desc": f"رسیدن به سطح پیشرفته {tier}",
                "icon": "Star"
            })

        if user.kyc_status == "VERIFIED":
            badges.append({
                "id": "verified",
                "title": "ورزشکار تاییدشده",
                "desc": "احراز هویت رسمی فدراسیونی در سامانه رالی",
                "icon": "CheckCircle2"
            })

        return badges

    @classmethod
    async def _get_recent_matches(cls, db: AsyncSession, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """واکشی مسابقات تکمیل شده با جزییات پارتنر، حریفان و امتیازات ست‌ها"""
        stmt = (
            select(MatchmakingGame, MatchResult, Club, Court)
            .join(MatchResult, MatchResult.game_id == MatchmakingGame.id)
            .outerjoin(Club, Club.id == MatchmakingGame.club_id)
            .outerjoin(Court, Court.id == MatchmakingGame.court_id)
            .where(
                MatchmakingGame.status == "COMPLETED",
                (MatchmakingGame.team_a_right_user_id == user_id) |
                (MatchmakingGame.team_a_left_user_id == user_id) |
                (MatchmakingGame.team_b_right_user_id == user_id) |
                (MatchmakingGame.team_b_left_user_id == user_id)
            )
            .order_by(desc(MatchResult.created_at))
            .limit(limit)
        )
        res = await db.execute(stmt)
        rows = res.all()

        if not rows:
            return []

        # جمع‌آوری شناسه‌های تمام بازیکنان درگیر جهت نام‌یابی در یک کوئری
        all_user_ids = set()
        for game, _, _, _ in rows:
            all_user_ids.update([
                game.team_a_right_user_id,
                game.team_a_left_user_id,
                game.team_b_right_user_id,
                game.team_b_left_user_id
            ])
        all_user_ids.discard(None)

        users_stmt = select(User).where(User.id.in_(list(all_user_ids)))
        users_res = await db.execute(users_stmt)
        user_names = {u.id: (u.full_name or f"ورزشکار {u.phone_number[-4:]}") for u in users_res.scalars().all()}

        matches = []
        for game, result, club, court in rows:
            # تشخیص تیم کاربر
            is_team_a = user_id in [game.team_a_right_user_id, game.team_a_left_user_id]
            user_team = "TEAM_A" if is_team_a else "TEAM_B"
            won = (result.winning_team == user_team)

            if is_team_a:
                partner_id = game.team_a_left_user_id if game.team_a_right_user_id == user_id else game.team_a_right_user_id
                opp_ids = [game.team_b_right_user_id, game.team_b_left_user_id]
                rating_change = result.team_a_rating_change
            else:
                partner_id = game.team_b_left_user_id if game.team_b_right_user_id == user_id else game.team_b_right_user_id
                opp_ids = [game.team_a_right_user_id, game.team_a_left_user_id]
                rating_change = result.team_b_rating_change

            partner_name = user_names.get(partner_id, "هم‌تیمی")
            opponents = [user_names.get(oid, "حریف") for oid in opp_ids if oid]

            # قالب‌بندی ست‌ها
            sets_formatted = [f"{result.team_a_set1}-{result.team_b_set1}", f"{result.team_a_set2}-{result.team_b_set2}"]
            if result.team_a_set3 is not None and result.team_b_set3 is not None:
                sets_formatted.append(f"{result.team_a_set3}-{result.team_b_set3}")
            score_summary = ", ".join(sets_formatted)

            matches.append({
                "game_id": game.id,
                "title": game.title,
                "club_name": club.name if club else "کلوپ پدل رالی",
                "court_name": court.name if court else "کورت استاندارد",
                "date": result.created_at.strftime("%Y-%m-%d") if result.created_at else "",
                "won": won,
                "rating_change": rating_change,
                "partner_name": partner_name,
                "opponents": opponents,
                "score_summary": score_summary,
                "skill_level": game.skill_level
            })

        return matches

    @classmethod
    async def update_sports_profile(
        cls,
        db: AsyncSession,
        user_id: str,
        dominant_hand: Optional[str] = None,
        preferred_side: Optional[str] = None,
        racket_name: Optional[str] = None,
        city: Optional[str] = None
    ) -> Dict[str, Any]:
        """به‌روزرسانی مشخصات ورزشی و فنی بازیکن"""
        stmt = select(User).where(User.id == user_id)
        res = await db.execute(stmt)
        user = res.scalar_one_or_none()
        if not user:
            raise ValueError(f"کاربر با شناسه {user_id} یافت نشد")

        if dominant_hand in ["RIGHT", "LEFT"]:
            user.dominant_hand = dominant_hand
        if preferred_side in ["RIGHT", "LEFT", "BOTH"]:
            user.preferred_side = preferred_side
        if racket_name:
            user.racket_name = racket_name.strip()
        if city:
            user.city = city.strip()

        await db.commit()
        await db.refresh(user)

        return {
            "id": user.id,
            "dominant_hand": user.dominant_hand,
            "preferred_side": user.preferred_side,
            "racket_name": user.racket_name,
            "city": user.city
        }
