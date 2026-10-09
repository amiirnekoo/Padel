export interface RacketVerdictParameters {
  power: number; // 1 - 10
  control: number; // 1 - 10
  maneuverability: number; // 1 - 10
  spin: number; // 1 - 10
  comfort: number; // 1 - 10
  sweetspot: number; // 1 - 10
  playability: number; // 1 - 10
  stability: number; // 1 - 10
}

export interface RacketTriadScores {
  att: number; // Attack Score (حمله و اسمش)
  hyb: number; // Hybrid Score (تعادل و مانور)
  def: number; // Defense Score (دفاع و دفع فشار)
}

export interface RacketStiffnessGauge {
  value: number; // 0 - 100
  label_fa: string;
  label_en: string;
}

export interface RacketVerdictData {
  overallScore: number; // e.g. 8.4
  verdictTitle_fa: string; // e.g. آیا راحتی بهترین موازنه برای بازی شماست؟
  verdictSummary_fa: string;
  playProfile_fa: string; // مدافع / همه‌کاره / تهاجمی
  playProfile_en: 'DEFENDER' | 'ALL-ROUND' | 'ATTACKER';
  playerLevel_fa: string; // متوسط / پیشرفته / حرفه‌ای / مبتدی
  racketShape_fa: string; // گرد / اشکی / الماسی
  stiffness: RacketStiffnessGauge;
  triad: RacketTriadScores;
  parameters: RacketVerdictParameters;
  weightGrams?: number;
  balanceMm?: number;
}

export interface CommunityReview {
  id: string;
  userName: string;
  playerLevel: string;
  rating: number; // Overall out of 10 or 5
  scores?: {
    power: number;
    control: number;
    comfort: number;
  };
  comment: string;
  date: string;
  likesCount: number;
  isVerifiedPlayer: boolean;
}
