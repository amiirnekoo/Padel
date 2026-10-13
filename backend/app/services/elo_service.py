import uuid
from typing import Tuple, List, Dict, Any
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.datetime_utils import utc_now
from backend.app.models.matchmaking import MatchmakingGame, MatchResult
from backend.app.models.user import User

class EloRatingService:
    BASE_K = 32
    
    # بازه‌های ریتینگ بر اساس سیستم جهانی مچ‌میکینگ پدل رالی
    SKILL_TIERS = [
        (2200, "A+"),
        (2050, "A"),
        (1900, "A-"),
        (1800, "B+"),
        (1680, "B"),
        (1580, "B-"),
        (1380, "C+"),
        (1200, "C"),
        (1100, "C-"),
        (1000, "D+"),
        (850, "D"),
        (0, "D-")
    ]

    @classmethod
    def get_skill_tier(cls, rating: int) -> str:
        """تبدیل ریتینگ عددی Elo به سطح مهارتی استاندارد پدل"""
        for threshold, tier in cls.SKILL_TIERS:
            if rating >= threshold:
                return tier
        return "D-"

    @classmethod
    def calculate_doubles_elo(
        cls,
        team_a_ratings: List[int],
        team_b_ratings: List[int],
        team_a_won: bool,
        set_scores: List[Tuple[int, int]]
    ) -> Tuple[int, int]:
        """
        محاسبه تغییر ریتینگ Elo برای مسابقات دابلز پدل.
        
        فرمول:
        1. میانگین ریتینگ تیم‌ها محاسبه می‌شود.
        2. احتمال پیروزی مورد انتظار هر تیم (Expected Score) تعیین می‌شود.
        3. ضریب تفاضل ست اعمال می‌شود (پیروزی ۲-۰ ضریب ۱.۱۵ دارد).
        4. تغییر نهایی امتیازات به عنوان Zero-Sum محاسبه و رند می‌شود.
        """
        avg_a = sum(team_a_ratings) / len(team_a_ratings)
        avg_b = sum(team_b_ratings) / len(team_b_ratings)

        # Expected score for Team A: 1 / (1 + 10^((Rb - Ra) / 400))
        expected_a = 1.0 / (1.0 + (10.0 ** ((avg_b - avg_a) / 400.0)))
        actual_a = 1.0 if team_a_won else 0.0

        # Margin multiplier based on set score
        team_a_sets = sum(1 for sa, sb in set_scores if sa > sb)
        team_b_sets = sum(1 for sa, sb in set_scores if sb > sa)
        
        # اگر در ۲ ست پیاپی برنده شده باشد (مثلاً ۲-۰)
        if team_a_sets == 2 and team_b_sets == 0:
            margin_multiplier = 1.15
        elif team_b_sets == 2 and team_a_sets == 0:
            margin_multiplier = 1.15
        else:
            margin_multiplier = 1.00  # بازی ۳ سته (۲-۱)

        delta_a = round(cls.BASE_K * margin_multiplier * (actual_a - expected_a))
        
        # اطمینان از حداقل تغییر ۱ امتیازی در صورت برد
        if team_a_won and delta_a <= 0:
            delta_a = 1
        elif not team_a_won and delta_a >= 0:
            delta_a = -1

        delta_b = -delta_a
        return delta_a, delta_b

    @classmethod
    async def record_match_result(
        cls,
        db: AsyncSession,
        game_id: str,
        set_scores: List[Tuple[int, int]],
        submitted_by_user_id: str
    ) -> Dict[str, Any]:
        """
        ثبت رسمی نتیجه مسابقه، محاسبه تغییرات ریتینگ هر ۴ بازیکن و ثبت در پایگاه داده.
        """
        game_stmt = select(MatchmakingGame).where(MatchmakingGame.id == game_id)
        game_res = await db.execute(game_stmt)
        game = game_res.scalar_one_or_none()
        if not game:
            raise ValueError("بازی مچ‌میکینگ یافت نشد")

        if game.status not in ["OPEN", "CONFIRMED"]:
            raise ValueError(f"امکان ثبت نتیجه برای بازی با وضعیت {game.status} وجود ندارد")

        team_a_ids = [game.team_a_right_user_id, game.team_a_left_user_id]
        team_b_ids = [game.team_b_right_user_id, game.team_b_left_user_id]

        if not all(team_a_ids + team_b_ids):
            raise ValueError("تمامی ۴ جایگاه بازیکنان برای ثبت نتیجه رسمی باید تکمیل باشند")

        # محاسبه ست‌های برده شده
        team_a_sets = sum(1 for sa, sb in set_scores if sa > sb)
        team_b_sets = sum(1 for sa, sb in set_scores if sb > sa)

        if team_a_sets == team_b_sets:
            raise ValueError("مسابقه پدل نمی‌تواند با نتیجه مساوی به پایان برسد")

        team_a_won = team_a_sets > team_b_sets
        winning_team = "TEAM_A" if team_a_won else "TEAM_B"

        # واکشی کاربران
        users_stmt = select(User).where(User.id.in_(team_a_ids + team_b_ids))
        users_res = await db.execute(users_stmt)
        user_map = {u.id: u for u in users_res.scalars().all()}

        p_a1 = user_map.get(game.team_a_right_user_id)
        p_a2 = user_map.get(game.team_a_left_user_id)
        p_b1 = user_map.get(game.team_b_right_user_id)
        p_b2 = user_map.get(game.team_b_left_user_id)

        rating_a1 = p_a1.elo_rating if p_a1 and p_a1.elo_rating else 1200
        rating_a2 = p_a2.elo_rating if p_a2 and p_a2.elo_rating else 1200
        rating_b1 = p_b1.elo_rating if p_b1 and p_b1.elo_rating else 1200
        rating_b2 = p_b2.elo_rating if p_b2 and p_b2.elo_rating else 1200

        delta_a, delta_b = cls.calculate_doubles_elo(
            team_a_ratings=[rating_a1, rating_a2],
            team_b_ratings=[rating_b1, rating_b2],
            team_a_won=team_a_won,
            set_scores=set_scores
        )

        # اعمال تغییرات ریتینگ روی کاربران
        for p, delta, won in [(p_a1, delta_a, team_a_won), (p_a2, delta_a, team_a_won), (p_b1, delta_b, not team_a_won), (p_b2, delta_b, not team_a_won)]:
            if p:
                current_elo = p.elo_rating or 1200
                p.elo_rating = max(500, current_elo + delta)
                p.matches_played = (p.matches_played or 0) + 1
                if won:
                    p.matches_won = (p.matches_won or 0) + 1
                p.skill_level = cls.get_skill_tier(p.elo_rating)

        # ثبت رکورد رسمی MatchResult
        set1 = set_scores[0]
        set2 = set_scores[1] if len(set_scores) > 1 else (0, 0)
        set3 = set_scores[2] if len(set_scores) > 2 else None

        match_res = MatchResult(
            id=str(uuid.uuid4()),
            game_id=game.id,
            team_a_set1=set1[0],
            team_b_set1=set1[1],
            team_a_set2=set2[0],
            team_b_set2=set2[1],
            team_a_set3=set3[0] if set3 else None,
            team_b_set3=set3[1] if set3 else None,
            winning_team=winning_team,
            team_a_rating_change=delta_a,
            team_b_rating_change=delta_b,
            submitted_by_user_id=submitted_by_user_id,
            confirmed_by_opponent=True,
            created_at=utc_now()
        )
        db.add(match_res)

        game.status = "COMPLETED"
        await db.commit()
        await db.refresh(game)

        return {
            "game_id": game.id,
            "status": game.status,
            "winning_team": winning_team,
            "team_a_rating_change": delta_a,
            "team_b_rating_change": delta_b,
            "set_scores": set_scores
        }

    @classmethod
    async def get_elo_leaderboard(cls, db: AsyncSession, limit: int = 50) -> List[Dict[str, Any]]:
        """دریافت لیدربورد ریتینگ مسابقات رالی بر اساس سیستم زنده Elo"""
        stmt = (
            select(User)
            .where(User.is_active == True)
            .order_by(desc(User.elo_rating))
            .limit(limit)
        )
        res = await db.execute(stmt)
        users = res.scalars().all()

        leaderboard = []
        for idx, u in enumerate(users, start=1):
            rating = u.elo_rating or 1200
            played = u.matches_played or 0
            won = u.matches_won or 0
            win_rate = round((won / played) * 100, 1) if played > 0 else 0.0

            leaderboard.append({
                "rank": idx,
                "user_id": u.id,
                "full_name": u.full_name or f"کاربر {u.phone_number[-4:]}",
                "elo_rating": rating,
                "skill_tier": cls.get_skill_tier(rating),
                "matches_played": played,
                "matches_won": won,
                "win_rate": win_rate,
                "city": u.city or "تهران"
            })
        return leaderboard
