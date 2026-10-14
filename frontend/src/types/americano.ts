export interface AmericanoMatch {
  match_id: string;
  court_number: number;
  team_a: [string, string];
  team_b: [string, string];
  score_a: number | null;
  score_b: number | null;
  is_completed: boolean;
}

export interface AmericanoRound {
  round_index: number;
  round_name: string;
  matches: AmericanoMatch[];
  is_completed: boolean;
}

export interface AmericanoPlayerStanding {
  rank: number;
  player_name: string;
  matches_played: number;
  matches_won: number;
  total_points: number;
  points_conceded: number;
  point_difference: number;
  win_rate: number;
}

export interface AmericanoTournamentState {
  id: string;
  title: string;
  club_name: string;
  total_players: number;
  points_per_match: number;
  players: string[];
  rounds: AmericanoRound[];
  current_round_index: number;
  is_finished: boolean;
  leaderboard: AmericanoPlayerStanding[];
}
