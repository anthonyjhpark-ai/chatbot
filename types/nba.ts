// NBA 관련 타입 정의

export interface NBAPlayer {
  id: string;
  player_id: string;
  name: string;
  team: string;
  position?: string;
  jersey_number?: number;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PlayerDailyStat {
  id: string;
  player_id: string;
  game_date: string;
  opponent: string;
  
  // 기본 스탯
  minutes_played?: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  
  // 슈팅 스탯
  field_goals_made: number;
  field_goals_attempted: number;
  field_goal_percentage?: number;
  three_pointers_made: number;
  three_pointers_attempted: number;
  three_point_percentage?: number;
  free_throws_made: number;
  free_throws_attempted: number;
  free_throw_percentage?: number;
  
  // 고급 스탯
  plus_minus?: number;
  
  // 메타 데이터
  home_away?: 'home' | 'away';
  win_loss?: 'win' | 'loss';
  
  created_at: string;
}

export interface ScoringWeight {
  id: string;
  name: string;
  description?: string;
  is_default: boolean;
  
  weight_points: number;
  weight_rebounds: number;
  weight_assists: number;
  weight_steals: number;
  weight_blocks: number;
  weight_turnovers: number;
  weight_fouls: number;
  weight_fg_percentage: number;
  weight_three_pointers: number;
  weight_ft_percentage: number;
  
  created_at: string;
  updated_at: string;
}

export interface PlayerScore {
  id: string;
  player_id: string;
  weight_id: string;
  game_date: string;
  score: number;
  created_at: string;
}

export interface PlayerRanking {
  name: string;
  team: string;
  position?: string;
  game_date: string;
  weight_name: string;
  score: number;
  rank: number;
}

export interface PlayerWithStats extends NBAPlayer {
  daily_stats?: PlayerDailyStat[];
  latest_score?: number;
  rank?: number;
}

export interface DashboardStats {
  total_players: number;
  games_today: number;
  avg_score: number;
  top_performer: {
    name: string;
    score: number;
    team: string;
  } | null;
}
