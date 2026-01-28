-- NBA 선수 스탯 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요

-- ============================================
-- 1. NBA 선수 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS nba_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id TEXT UNIQUE NOT NULL, -- 외부 API의 선수 ID
  name TEXT NOT NULL,
  team TEXT NOT NULL,
  position TEXT,
  jersey_number INTEGER,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nba_players_player_id ON nba_players(player_id);
CREATE INDEX IF NOT EXISTS idx_nba_players_team ON nba_players(team);

-- ============================================
-- 2. 선수 일일 스탯 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS player_daily_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES nba_players(id) ON DELETE CASCADE,
  game_date DATE NOT NULL,
  opponent TEXT NOT NULL,
  
  -- 기본 스탯
  minutes_played DECIMAL(5,2),
  points INTEGER DEFAULT 0,
  rebounds INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  steals INTEGER DEFAULT 0,
  blocks INTEGER DEFAULT 0,
  turnovers INTEGER DEFAULT 0,
  fouls INTEGER DEFAULT 0,
  
  -- 슈팅 스탯
  field_goals_made INTEGER DEFAULT 0,
  field_goals_attempted INTEGER DEFAULT 0,
  field_goal_percentage DECIMAL(5,2),
  three_pointers_made INTEGER DEFAULT 0,
  three_pointers_attempted INTEGER DEFAULT 0,
  three_point_percentage DECIMAL(5,2),
  free_throws_made INTEGER DEFAULT 0,
  free_throws_attempted INTEGER DEFAULT 0,
  free_throw_percentage DECIMAL(5,2),
  
  -- 고급 스탯
  plus_minus INTEGER,
  
  -- 메타 데이터
  home_away TEXT CHECK (home_away IN ('home', 'away')),
  win_loss TEXT CHECK (win_loss IN ('win', 'loss')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(player_id, game_date)
);

CREATE INDEX IF NOT EXISTS idx_player_daily_stats_player_id ON player_daily_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_player_daily_stats_game_date ON player_daily_stats(game_date DESC);

-- ============================================
-- 2-1. 선수 시즌 평균 스탯 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS player_season_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES nba_players(id) ON DELETE CASCADE,
  season TEXT NOT NULL, -- 예: '2025-26'
  
  -- 경기 정보
  games_played INTEGER DEFAULT 0,
  minutes_played DECIMAL(5,2),
  
  -- 기본 스탯 (경기당 평균)
  points DECIMAL(5,2) DEFAULT 0,
  rebounds DECIMAL(5,2) DEFAULT 0,
  assists DECIMAL(5,2) DEFAULT 0,
  steals DECIMAL(5,2) DEFAULT 0,
  blocks DECIMAL(5,2) DEFAULT 0,
  turnovers DECIMAL(5,2) DEFAULT 0,
  fouls DECIMAL(5,2) DEFAULT 0,
  
  -- 슈팅 스탯 (경기당 평균)
  field_goals_made DECIMAL(5,2) DEFAULT 0,
  field_goals_attempted DECIMAL(5,2) DEFAULT 0,
  field_goal_percentage DECIMAL(5,2),
  three_pointers_made DECIMAL(5,2) DEFAULT 0,
  three_pointers_attempted DECIMAL(5,2) DEFAULT 0,
  three_point_percentage DECIMAL(5,2),
  free_throws_made DECIMAL(5,2) DEFAULT 0,
  free_throws_attempted DECIMAL(5,2) DEFAULT 0,
  free_throw_percentage DECIMAL(5,2),
  
  -- 고급 스탯
  offensive_rebounds DECIMAL(5,2) DEFAULT 0,
  defensive_rebounds DECIMAL(5,2) DEFAULT 0,
  double_doubles INTEGER DEFAULT 0,
  triple_doubles INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(player_id, season)
);

CREATE INDEX IF NOT EXISTS idx_player_season_stats_player_id ON player_season_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_player_season_stats_season ON player_season_stats(season);

-- ============================================
-- 3. 가중치 설정 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS scoring_weights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  
  -- 가중치 값들
  weight_points DECIMAL(5,2) DEFAULT 1.0,
  weight_rebounds DECIMAL(5,2) DEFAULT 1.2,
  weight_assists DECIMAL(5,2) DEFAULT 1.5,
  weight_steals DECIMAL(5,2) DEFAULT 3.0,
  weight_blocks DECIMAL(5,2) DEFAULT 3.0,
  weight_turnovers DECIMAL(5,2) DEFAULT -2.0,
  weight_fouls DECIMAL(5,2) DEFAULT -1.0,
  weight_fg_percentage DECIMAL(5,2) DEFAULT 0.5,
  weight_three_pointers DECIMAL(5,2) DEFAULT 0.5,
  weight_ft_percentage DECIMAL(5,2) DEFAULT 0.2,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기본 가중치 세트 삽입
INSERT INTO scoring_weights (name, description, is_default, 
  weight_points, weight_rebounds, weight_assists, weight_steals, weight_blocks, 
  weight_turnovers, weight_fouls, weight_fg_percentage, weight_three_pointers, weight_ft_percentage)
VALUES 
  ('기본', '기본 가중치 설정', true, 1.0, 1.2, 1.5, 3.0, 3.0, -2.0, -1.0, 0.5, 0.5, 0.2),
  ('공격 중심', '득점과 공격 효율성 강조', false, 1.5, 0.8, 1.3, 2.0, 2.0, -3.0, -0.5, 1.0, 1.2, 0.3),
  ('수비 중심', '수비 스탯 강조', false, 0.8, 1.5, 1.0, 4.0, 4.0, -1.5, -2.0, 0.3, 0.3, 0.1),
  ('플레이메이커', '어시스트와 팀플레이 강조', false, 0.9, 1.0, 2.5, 2.5, 2.0, -3.0, -1.0, 0.4, 0.4, 0.2)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 4. 선수 종합 점수 테이블 (계산된 점수 저장)
-- ============================================
CREATE TABLE IF NOT EXISTS player_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES nba_players(id) ON DELETE CASCADE,
  weight_id UUID NOT NULL REFERENCES scoring_weights(id) ON DELETE CASCADE,
  game_date DATE NOT NULL,
  
  score DECIMAL(10,2) NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(player_id, weight_id, game_date)
);

CREATE INDEX IF NOT EXISTS idx_player_scores_player_id ON player_scores(player_id);
CREATE INDEX IF NOT EXISTS idx_player_scores_game_date ON player_scores(game_date DESC);
CREATE INDEX IF NOT EXISTS idx_player_scores_score ON player_scores(score DESC);

-- ============================================
-- 5. Row Level Security (RLS) 설정
-- ============================================

ALTER TABLE nba_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_season_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_scores ENABLE ROW LEVEL SECURITY;

-- 개발용: 모든 사용자가 읽기/쓰기 가능
CREATE POLICY "Allow all access to nba_players" ON nba_players FOR ALL USING (true);
CREATE POLICY "Allow all access to player_daily_stats" ON player_daily_stats FOR ALL USING (true);
CREATE POLICY "Allow all access to player_season_stats" ON player_season_stats FOR ALL USING (true);
CREATE POLICY "Allow all access to scoring_weights" ON scoring_weights FOR ALL USING (true);
CREATE POLICY "Allow all access to player_scores" ON player_scores FOR ALL USING (true);

-- ============================================
-- 6. 뷰: 최신 선수 랭킹
-- ============================================
CREATE OR REPLACE VIEW player_rankings AS
SELECT 
  p.name,
  p.team,
  p.position,
  ps.game_date,
  sw.name as weight_name,
  ps.score,
  ROW_NUMBER() OVER (PARTITION BY ps.weight_id, ps.game_date ORDER BY ps.score DESC) as rank
FROM player_scores ps
JOIN nba_players p ON ps.player_id = p.id
JOIN scoring_weights sw ON ps.weight_id = sw.id
ORDER BY ps.game_date DESC, ps.score DESC;

-- ============================================
-- 7. 함수: 점수 계산
-- ============================================
CREATE OR REPLACE FUNCTION calculate_player_score(
  stat_id UUID,
  weight_id UUID
) RETURNS DECIMAL AS $$
DECLARE
  score DECIMAL;
BEGIN
  SELECT 
    (pds.points * sw.weight_points) +
    (pds.rebounds * sw.weight_rebounds) +
    (pds.assists * sw.weight_assists) +
    (pds.steals * sw.weight_steals) +
    (pds.blocks * sw.weight_blocks) +
    (pds.turnovers * sw.weight_turnovers) +
    (pds.fouls * sw.weight_fouls) +
    (COALESCE(pds.field_goal_percentage, 0) * sw.weight_fg_percentage) +
    (pds.three_pointers_made * sw.weight_three_pointers) +
    (COALESCE(pds.free_throw_percentage, 0) * sw.weight_ft_percentage)
  INTO score
  FROM player_daily_stats pds
  CROSS JOIN scoring_weights sw
  WHERE pds.id = stat_id AND sw.id = weight_id;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;
