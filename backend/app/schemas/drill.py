from datetime import datetime
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator, model_validator
import re


class SportType(str, Enum):
    PADEL = "PADEL"
    TENNIS = "TENNIS"


class DrillCategory(str, Enum):
    TECHNIQUE = "TECHNIQUE"
    TACTICS = "TACTICS"
    PHYSICAL_FITNESS = "PHYSICAL_FITNESS"
    MENTAL_SKILLS = "MENTAL_SKILLS"


class DrillLevel(str, Enum):
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"
    PRO = "PRO"


class ParticipantType(str, Enum):
    SOLO = "SOLO"
    PAIR = "PAIR"
    GROUP = "GROUP"


class DrillStatus(str, Enum):
    DRAFT = "DRAFT"
    PENDING_REVIEW = "PENDING_REVIEW"
    APPROVED = "APPROVED"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"


class MediaType(str, Enum):
    VIDEO = "VIDEO"
    IMAGE = "IMAGE"
    DIAGRAM = "DIAGRAM"
    SUBTITLE = "SUBTITLE"


class MediaProvenance(str, Enum):
    REAL_RECORDING = "REAL_RECORDING"
    AI_GENERATED = "AI_GENERATED"
    HYBRID = "HYBRID"
    UNSPECIFIED = "UNSPECIFIED"


class UsageRightsStatus(str, Enum):
    OWNED = "OWNED"
    LICENSED = "LICENSED"
    PUBLIC_DOMAIN = "PUBLIC_DOMAIN"
    UNAUTHORIZED = "UNAUTHORIZED"


class DurationBracket(str, Enum):
    UNDER_15 = "<15"
    BETWEEN_15_AND_30 = "15-30"
    OVER_30 = ">30"


# -------------------------------------------------------------
# Structured Content Sub-Schemas
# -------------------------------------------------------------

class DrillStep(BaseModel):
    step_number: int = Field(..., ge=1, description="شماره ترتیبی مرحله")
    title: str = Field(..., min_length=2, max_length=100, description="عنوان گام")
    instruction: str = Field("", max_length=1000, description="دستورالعمل اجرایی گام")
    description: Optional[str] = Field(None, description="شرح گام")
    duration_seconds: Optional[int] = Field(None, description="مدت زمان مرحله به ثانیه")
    tips: Optional[str] = Field(None, description="نکته کلیدی")
    reps_or_time: Optional[str] = Field(None, max_length=60, description="تعداد تکرار یا زمان مرحله")

    @model_validator(mode="before")
    @classmethod
    def sync_instruction_and_description(cls, values):
        if isinstance(values, dict):
            inst = values.get("instruction")
            desc = values.get("description")
            if not inst and desc:
                values["instruction"] = desc
            elif not desc and inst:
                values["description"] = inst
            elif not inst and not desc:
                values["instruction"] = "اجرای مرحله"
                values["description"] = "اجرای مرحله"
        return values


class CommonMistake(BaseModel):
    mistake: str = Field(..., min_length=2, max_length=255, description="اشتباه رایج")
    correction: str = Field(..., min_length=2, max_length=500, description="روش صحیح اصلاح")


# -------------------------------------------------------------
# Media Schemas
# -------------------------------------------------------------

class DrillMediaPublicOut(BaseModel):
    id: str
    media_type: MediaType
    mime_type: str
    file_size_bytes: int
    duration_seconds: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    display_order: int
    is_cover: bool
    provenance: MediaProvenance
    usage_rights_status: UsageRightsStatus
    language: str
    stream_url: str


class DrillMediaAdminOut(DrillMediaPublicOut):
    original_filename: str
    storage_key: str
    validation_status: str
    validation_error: Optional[str] = None
    license_details: Optional[str] = None
    created_at: datetime


class DrillMediaUpdateIn(BaseModel):
    display_order: Optional[int] = Field(None, ge=0)
    is_cover: Optional[bool] = None
    provenance: Optional[MediaProvenance] = None
    usage_rights_status: Optional[UsageRightsStatus] = None
    license_details: Optional[str] = Field(None, max_length=500)


class DrillMediaUploadIn(BaseModel):
    file_base64: str = Field(..., description="محتوای فایل رسانه به صورت Base64")
    original_filename: str = Field(..., min_length=1, max_length=255, description="نام اصلی فایل")
    media_type: MediaType = Field(default=MediaType.VIDEO)
    is_cover: bool = Field(default=False)
    provenance: MediaProvenance = Field(default=MediaProvenance.REAL_RECORDING)
    usage_rights_status: UsageRightsStatus = Field(default=UsageRightsStatus.OWNED)
    license_details: Optional[str] = Field(None, max_length=500)


# -------------------------------------------------------------
# Drill Public Schemas
# -------------------------------------------------------------

class DrillPublicListItem(BaseModel):
    id: str
    slug: str
    sport: SportType
    category: DrillCategory
    level: DrillLevel
    participant_type: ParticipantType
    title: str
    summary: str
    duration_minutes: int
    cover_image_url: Optional[str] = None
    has_video: bool
    published_at: Optional[datetime] = None


class DrillPublicDetailOut(BaseModel):
    id: str
    slug: str
    sport: SportType
    category: DrillCategory
    level: DrillLevel
    participant_type: ParticipantType
    title: str
    summary: str
    objective: str
    duration_minutes: int
    equipment_required: List[str]
    steps: List[DrillStep]
    common_mistakes: List[CommonMistake]
    safety_precautions: List[str]
    cover_image_url: Optional[str] = None
    media_items: List[DrillMediaPublicOut]
    published_at: Optional[datetime] = None


# -------------------------------------------------------------
# Drill Admin Schemas
# -------------------------------------------------------------

class DrillCreateIn(BaseModel):
    slug: str = Field(..., min_length=3, max_length=140)
    sport: SportType
    category: DrillCategory
    level: DrillLevel
    participant_type: ParticipantType = ParticipantType.SOLO
    title: str = Field(..., min_length=3, max_length=255)
    summary: str = Field(..., min_length=10, max_length=1000)
    objective: str = Field(..., min_length=10, max_length=1000)
    duration_minutes: int = Field(..., ge=1, le=180)
    equipment_required: List[str] = Field(default_factory=list)
    steps: List[DrillStep] = Field(default_factory=list)
    common_mistakes: List[CommonMistake] = Field(default_factory=list)
    safety_precautions: List[str] = Field(default_factory=list)

    @field_validator("slug")
    def validate_slug(cls, v: str) -> str:
        clean = v.strip().lower()
        if not re.match(r"^[a-z0-9]+(?:-[a-z0-9]+)*$", clean):
            raise ValueError("اسلاگ باید فقط شامل حروف کوچک انگلیسی، اعداد و خط تیره (-) باشد.")
        return clean


class DrillUpdateIn(BaseModel):
    expected_version: int = Field(..., ge=1, description="کنترل همروندی: نسخه مورد انتظار کلاینت")
    slug: Optional[str] = Field(None, min_length=3, max_length=140)
    sport: Optional[SportType] = None
    category: Optional[DrillCategory] = None
    level: Optional[DrillLevel] = None
    participant_type: Optional[ParticipantType] = None
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    summary: Optional[str] = Field(None, min_length=10, max_length=1000)
    objective: Optional[str] = Field(None, min_length=10, max_length=1000)
    duration_minutes: Optional[int] = Field(None, ge=1, le=180)
    equipment_required: Optional[List[str]] = None
    steps: Optional[List[DrillStep]] = None
    common_mistakes: Optional[List[CommonMistake]] = None
    safety_precautions: Optional[List[str]] = None

    @field_validator("slug")
    def validate_slug(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        clean = v.strip().lower()
        if not re.match(r"^[a-z0-9]+(?:-[a-z0-9]+)*$", clean):
            raise ValueError("اسلاگ باید فقط شامل حروف کوچک انگلیسی، اعداد و خط تیره (-) باشد.")
        return clean


class DrillReviewChecklist(BaseModel):
    suitability_approved: bool = Field(True, description="تناسب آموزش با ورزش، سطح و هدف")
    media_sync_approved: bool = Field(True, description="هماهنگی متن، ویدیو و زیرنویس")
    movement_clarity_approved: bool = Field(True, description="وضوح اجرای حرکت")
    pedagogical_notes: Optional[str] = Field(None, max_length=500, description="اشتباه یا ابهام آموزشی")
    safety_notes: Optional[str] = Field(None, max_length=500, description="نکات احتیاطی لازم")
    verified_media_ids: List[str] = Field(default_factory=list, description="شناسه رسانه‌های دقیق بررسی‌شده")


class DrillReviewIn(BaseModel):
    action: str = Field(..., pattern="^(APPROVE|REJECT)$", description="اقدام بازبینی: APPROVE یا REJECT")
    review_notes: Optional[str] = Field(None, max_length=1000, description="توضیحات بازبین فنی")
    checklist: Optional[DrillReviewChecklist] = None


class DrillPublishIn(BaseModel):
    confirm_usage_rights: bool = Field(..., description="تأییدیه بررسی حقوق نشر و لایسنس رسانه‌ها")


class DrillAdminOut(BaseModel):
    id: str
    slug: str
    sport: SportType
    category: DrillCategory
    level: DrillLevel
    participant_type: ParticipantType
    title: str
    summary: str
    objective: str
    duration_minutes: int
    equipment_required: List[str]
    steps: List[DrillStep]
    common_mistakes: List[CommonMistake]
    safety_precautions: List[str]
    status: DrillStatus
    content_version: int
    approved_version: Optional[int] = None
    author_id: Optional[str] = None
    author_name: str
    reviewer_id: Optional[str] = None
    reviewer_name: Optional[str] = None
    review_notes: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    last_editor_id: Optional[str] = None
    last_editor_name: Optional[str] = None
    version_contributors: List[str] = Field(default_factory=list)
    cover_media_id: Optional[str] = None
    cover_image_url: Optional[str] = None
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    media_items: List[DrillMediaAdminOut] = Field(default_factory=list)


class SetCoverIn(BaseModel):
    media_id: str = Field(..., description="شناسه رسانه جهت تنظیم به عنوان تصویر جلد")


class MediaPreviewTokenOut(BaseModel):
    preview_url: str
    expires_at: datetime


# -------------------------------------------------------------
# Activity & Idempotent Completion Schemas
# -------------------------------------------------------------

class BookmarkIn(BaseModel):
    bookmarked: bool = Field(..., description="وضعیت نشان‌کردن تمرین (true برای ذخیره، false برای برداشتن نشان)")


class BookmarkOut(BaseModel):
    drill_id: str
    is_bookmarked: bool
    bookmarked_at: Optional[datetime] = None


class CompletionEventIn(BaseModel):
    idempotency_key: str = Field(..., min_length=8, max_length=100, description="کلید یکتایی کلاینت برای جلوگیری از ثبت تکراری")
    client_timestamp: Optional[datetime] = Field(None, description="زمان محلی اعلام‌شده توسط کلاینت")


class CompletionEventOut(BaseModel):
    event_id: str
    drill_id: str
    idempotency_key: str
    status: str = Field(..., description="CREATED یا ALREADY_RECORDED")
    completion_count: int
    server_timestamp: datetime
    disclaimer: str = "ثبت رویداد ورزشی کاربر انجام شد (این ثبت به معنی اثبات یا اندازه‌گیری سطح مهارت ورزشی نیست)."


class UserActivitySummaryItem(BaseModel):
    drill_id: str
    slug: str
    title: str
    sport: str
    category: str
    is_bookmarked: bool
    bookmarked_at: Optional[datetime] = None
    completion_count: int
    last_completed_at: Optional[datetime] = None
