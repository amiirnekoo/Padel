/**
 * تعاریف داده و تایپ‌های ماژول تمرینات تخصصی رالی
 */

export type DrillSport = 'padel' | 'tennis';
export type DrillCategory = 'technique' | 'tactics' | 'fitness' | 'mental';
export type DrillLevel = 'beginner' | 'intermediate' | 'advanced' | 'pro';
export type DrillParticipation = 'solo' | 'pairs' | 'four' | 'group';

export type DrillStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'archived';
export type DrillReviewDecision = 'approved' | 'rejected' | 'changes_requested';
export type DrillOriginSource = 'original' | 'licensed' | 'public_domain';

export type DrillMediaKind = 'video' | 'cover_image' | 'infographic' | 'subtitle';
export type DrillMediaStatus = 'received' | 'validating' | 'valid' | 'rejected';

export interface DrillStepItem {
  id?: string;
  step_number: number;
  title: string;
  description: string;
  duration_seconds?: number | null;
  tips?: string | null;
  key_points?: string[];
}

export interface DrillMediaItem {
  id: string;
  drill_id: string;
  media_type: DrillMediaKind;
  media_status: DrillMediaStatus;
  original_filename: string;
  storage_path: string;
  file_size_bytes: number;
  mime_type: string;
  duration_seconds?: number | null;
  width?: number | null;
  height?: number | null;
  is_cover: boolean;
  validation_error?: string | null;
  codec?: string | null;
  sort_order: number;
  created_at: string;
}

export interface DrillListItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  sport: DrillSport;
  category: DrillCategory;
  level: DrillLevel;
  duration_minutes: number;
  participation_type: DrillParticipation;
  intensity?: string | null;
  equipment_needed?: string[] | null;
  status: DrillStatus;
  cover_media_id?: string | null;
  cover_url?: string | null;
  view_count: number;
  completion_count: number;
  bookmark_count: number;
  is_bookmarked?: boolean;
  has_completed?: boolean;
  published_at?: string | null;
}

export interface DrillDetail extends DrillListItem {
  objective: string;
  prerequisites?: string | null;
  court_setup_notes?: string | null;
  min_players: number;
  max_players: number;
  common_mistakes?: string[] | null;
  safety_precautions?: string[] | null;
  author_id: string;
  author_name: string;
  last_editor_id?: string | null;
  last_editor_name?: string | null;
  reviewer_id?: string | null;
  reviewer_name?: string | null;
  review_notes?: string | null;
  content_version: number;
  origin_source: DrillOriginSource;
  rights_holder?: string | null;
  usage_rights_confirmed: boolean;
  steps: DrillStepItem[];
  media_items: DrillMediaItem[];
}

export interface DrillFilters {
  sport?: DrillSport;
  category?: DrillCategory;
  level?: DrillLevel;
  participation?: DrillParticipation;
  query?: string;
  min_duration?: number;
  max_duration?: number;
  page?: number;
  page_size?: number;
}

export interface DrillListResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  drills: DrillListItem[];
}

export interface DrillBookmarkResponse {
  is_bookmarked: boolean;
  bookmark_count: number;
}

export interface DrillCompletionResponse {
  drill_id: string;
  completion_count: number;
  logged_at: string;
  message: string;
}

export interface DrillEphemeralTokenResponse {
  token: string;
  expires_at: string;
  preview_url: string;
}
