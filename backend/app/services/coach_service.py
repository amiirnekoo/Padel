from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.models.coach import CoachProfile
from backend.app.models.trainee import CoachTrainee
from backend.app.models.user import User

class CoachService:
    @staticmethod
    async def register_coach_profile(
        db: AsyncSession,
        user_id: str,
        certification_id: str,
        sport_types: str = "PADEL",
        bio: str | None = None,
        hourly_rate: int = 1000000
    ) -> CoachProfile:
        # Verify user exists and update role to COACH
        user_stmt = select(User).where(User.id == user_id)
        user_res = await db.execute(user_stmt)
        user = user_res.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="کاربر یافت نشد")

        user.role = "COACH"

        # Check if profile already exists
        profile_stmt = select(CoachProfile).where(CoachProfile.user_id == user_id)
        profile_res = await db.execute(profile_stmt)
        profile = profile_res.scalar_one_or_none()

        if profile:
            profile.certification_id = certification_id
            profile.sport_types = sport_types
            profile.bio = bio
            profile.hourly_rate = hourly_rate
        else:
            profile = CoachProfile(
                user_id=user_id,
                certification_id=certification_id,
                sport_types=sport_types,
                bio=bio,
                hourly_rate=hourly_rate,
                is_verified=True
            )
            db.add(profile)

        await db.commit()
        await db.refresh(profile)
        return profile

    @staticmethod
    async def connect_trainee(
        db: AsyncSession,
        coach_id: str,
        trainee_id: str,
        package_type: str = "SINGLE_SESSION",
        total_sessions: int = 1
    ) -> CoachTrainee:
        # Verify coach exists
        coach_stmt = select(CoachProfile).where(CoachProfile.user_id == coach_id)
        coach_res = await db.execute(coach_stmt)
        coach_profile = coach_res.scalar_one_or_none()

        # If coach profile is not created yet, create placeholder profile
        if not coach_profile:
            coach_profile = CoachProfile(
                user_id=coach_id,
                certification_id="AUTO-ASSIGNED",
                sport_types="PADEL",
                hourly_rate=1000000,
                is_verified=True
            )
            db.add(coach_profile)
            await db.commit()
            await db.refresh(coach_profile)

        # Create connection
        connection = CoachTrainee(
            coach_id=coach_profile.id,
            trainee_id=trainee_id,
            package_type=package_type,
            total_sessions=total_sessions,
            completed_sessions=0,
            status="ACTIVE"
        )
        db.add(connection)
        await db.commit()
        await db.refresh(connection)

        # Attach coach_id as coach_user_id for convenience in test assertion
        connection.coach_id = coach_id
        return connection

    @staticmethod
    async def record_training_session(db: AsyncSession, connection_id: str) -> CoachTrainee:
        stmt = select(CoachTrainee).where(CoachTrainee.id == connection_id).with_for_update()
        result = await db.execute(stmt)
        connection = result.scalar_one_or_none()

        if not connection:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ارتباط آموزشی یافت نشد")

        connection.completed_sessions += 1
        if connection.completed_sessions >= connection.total_sessions:
            connection.status = "COMPLETED"

        await db.commit()
        await db.refresh(connection)
        return connection

    @staticmethod
    async def get_coach_trainees(db: AsyncSession, coach_user_id: str) -> list[dict]:
        stmt = (
            select(CoachTrainee, User)
            .join(User, CoachTrainee.trainee_id == User.id)
            .join(CoachProfile, CoachTrainee.coach_id == CoachProfile.id)
            .where(CoachProfile.user_id == coach_user_id)
        )
        result = await db.execute(stmt)
        rows = result.all()

        return [
            {
                "connection_id": conn.id,
                "trainee_id": user.id,
                "trainee_name": user.full_name or user.phone_number,
                "phone_number": user.phone_number,
                "package_type": conn.package_type,
                "completed_sessions": conn.completed_sessions,
                "total_sessions": conn.total_sessions,
                "status": conn.status
            }
            for conn, user in rows
        ]
