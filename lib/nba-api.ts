// NBA API 연동 유틸리티
// 실제 NBA API (예: NBA API, SportsData.io, RapidAPI 등) 연동 시 사용

import { PlayerDailyStat } from '@/types/nba';

// 실제 사용할 NBA API 설정
const NBA_API_KEY = process.env.NBA_API_KEY || '';
const NBA_API_BASE_URL = process.env.NBA_API_BASE_URL || 'https://api.sportsdata.io/v3/nba';

/**
 * 오늘 날짜의 모든 경기 스탯 가져오기
 */
export async function fetchTodayStats(): Promise<any[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // TODO: 실제 NBA API 엔드포인트로 교체
    // 예시: SportsData.io, Ball Don't Lie API, NBA Stats API 등
    const response = await fetch(
      `${NBA_API_BASE_URL}/scores/json/GamesByDate/${today}?key=${NBA_API_KEY}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 }, // 5분마다 재검증
      }
    );

    if (!response.ok) {
      throw new Error(`NBA API error: ${response.status}`);
    }

    const games = await response.json();
    return games;
  } catch (error) {
    console.error('Error fetching today stats:', error);
    return [];
  }
}

/**
 * 특정 선수의 최근 스탯 가져오기
 */
export async function fetchPlayerStats(playerId: string, days: number = 7): Promise<any[]> {
  try {
    // TODO: 실제 API 엔드포인트로 교체
    const response = await fetch(
      `${NBA_API_BASE_URL}/stats/json/PlayerGameStatsByPlayer/${playerId}?key=${NBA_API_KEY}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      throw new Error(`NBA API error: ${response.status}`);
    }

    const stats = await response.json();
    return stats;
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return [];
  }
}

/**
 * 모든 활성 선수 목록 가져오기
 */
export async function fetchActivePlayers(): Promise<any[]> {
  try {
    // TODO: 실제 API 엔드포인트로 교체
    const response = await fetch(
      `${NBA_API_BASE_URL}/scores/json/Players?key=${NBA_API_KEY}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 86400 }, // 24시간마다 재검증
      }
    );

    if (!response.ok) {
      throw new Error(`NBA API error: ${response.status}`);
    }

    const players = await response.json();
    return players;
  } catch (error) {
    console.error('Error fetching active players:', error);
    return [];
  }
}

/**
 * API 데이터를 내부 형식으로 변환
 */
export function transformAPIStatToInternal(apiStat: any): Partial<PlayerDailyStat> {
  // TODO: 실제 API 응답 구조에 맞게 변환
  return {
    game_date: apiStat.Day || apiStat.DateTime?.split('T')[0],
    opponent: apiStat.Opponent,
    minutes_played: apiStat.Minutes || 0,
    points: apiStat.Points || 0,
    rebounds: (apiStat.Rebounds || 0) + (apiStat.OffensiveRebounds || 0),
    assists: apiStat.Assists || 0,
    steals: apiStat.Steals || 0,
    blocks: apiStat.BlockedShots || 0,
    turnovers: apiStat.Turnovers || 0,
    fouls: apiStat.PersonalFouls || 0,
    field_goals_made: apiStat.FieldGoalsMade || 0,
    field_goals_attempted: apiStat.FieldGoalsAttempted || 0,
    field_goal_percentage: apiStat.FieldGoalsPercentage || 0,
    three_pointers_made: apiStat.ThreePointersMade || 0,
    three_pointers_attempted: apiStat.ThreePointersAttempted || 0,
    three_point_percentage: apiStat.ThreePointersPercentage || 0,
    free_throws_made: apiStat.FreeThrowsMade || 0,
    free_throws_attempted: apiStat.FreeThrowsAttempted || 0,
    free_throw_percentage: apiStat.FreeThrowsPercentage || 0,
    plus_minus: apiStat.PlusMinus || 0,
    home_away: apiStat.HomeOrAway?.toLowerCase() as 'home' | 'away',
  };
}

/**
 * 목 데이터 생성 (개발/테스트용)
 */
export function generateMockStats(playerName: string, date: string): Partial<PlayerDailyStat> {
  return {
    game_date: date,
    opponent: ['LAL', 'GSW', 'BOS', 'MIA', 'PHX'][Math.floor(Math.random() * 5)],
    minutes_played: 30 + Math.random() * 10,
    points: Math.floor(Math.random() * 35) + 5,
    rebounds: Math.floor(Math.random() * 12) + 2,
    assists: Math.floor(Math.random() * 10) + 1,
    steals: Math.floor(Math.random() * 3),
    blocks: Math.floor(Math.random() * 3),
    turnovers: Math.floor(Math.random() * 4),
    fouls: Math.floor(Math.random() * 4) + 1,
    field_goals_made: Math.floor(Math.random() * 12) + 3,
    field_goals_attempted: Math.floor(Math.random() * 10) + 15,
    field_goal_percentage: 40 + Math.random() * 20,
    three_pointers_made: Math.floor(Math.random() * 5),
    three_pointers_attempted: Math.floor(Math.random() * 8),
    three_point_percentage: 30 + Math.random() * 20,
    free_throws_made: Math.floor(Math.random() * 6),
    free_throws_attempted: Math.floor(Math.random() * 3) + 6,
    free_throw_percentage: 70 + Math.random() * 20,
    plus_minus: Math.floor(Math.random() * 30) - 15,
    home_away: Math.random() > 0.5 ? 'home' : 'away',
    win_loss: Math.random() > 0.5 ? 'win' : 'loss',
  };
}
