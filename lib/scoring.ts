// 점수 계산 유틸리티

import { PlayerDailyStat, ScoringWeight } from '@/types/nba';

/**
 * 선수 스탯을 가중치에 따라 종합 점수로 계산
 */
export function calculateScore(
  stat: PlayerDailyStat,
  weight: ScoringWeight
): number {
  const score =
    (stat.points || 0) * weight.weight_points +
    (stat.rebounds || 0) * weight.weight_rebounds +
    (stat.assists || 0) * weight.weight_assists +
    (stat.steals || 0) * weight.weight_steals +
    (stat.blocks || 0) * weight.weight_blocks +
    (stat.turnovers || 0) * weight.weight_turnovers +
    (stat.fouls || 0) * weight.weight_fouls +
    (stat.field_goal_percentage || 0) * weight.weight_fg_percentage +
    (stat.three_pointers_made || 0) * weight.weight_three_pointers +
    (stat.free_throw_percentage || 0) * weight.weight_ft_percentage;

  return Math.round(score * 100) / 100; // 소수점 둘째자리까지
}

/**
 * 여러 스탯의 평균 점수 계산
 */
export function calculateAverageScore(
  stats: PlayerDailyStat[],
  weight: ScoringWeight
): number {
  if (stats.length === 0) return 0;

  const totalScore = stats.reduce((sum, stat) => {
    return sum + calculateScore(stat, weight);
  }, 0);

  return Math.round((totalScore / stats.length) * 100) / 100;
}

/**
 * 스탯 트렌드 계산 (상승/하락)
 */
export function calculateTrend(
  stats: PlayerDailyStat[],
  weight: ScoringWeight,
  days: number = 7
): {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
} {
  if (stats.length < 2) {
    return {
      current: 0,
      previous: 0,
      change: 0,
      changePercent: 0,
      trend: 'stable',
    };
  }

  // 날짜순 정렬 (최신순)
  const sortedStats = [...stats].sort(
    (a, b) => new Date(b.game_date).getTime() - new Date(a.game_date).getTime()
  );

  const currentStats = sortedStats.slice(0, Math.floor(days / 2));
  const previousStats = sortedStats.slice(
    Math.floor(days / 2),
    days
  );

  const currentAvg = calculateAverageScore(currentStats, weight);
  const previousAvg = calculateAverageScore(previousStats, weight);

  const change = currentAvg - previousAvg;
  const changePercent = previousAvg !== 0 ? (change / previousAvg) * 100 : 0;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (changePercent > 5) trend = 'up';
  else if (changePercent < -5) trend = 'down';

  return {
    current: currentAvg,
    previous: previousAvg,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    trend,
  };
}

/**
 * 선수들을 점수로 랭킹 정렬
 */
export function rankPlayers<T extends { score?: number }>(
  players: T[]
): (T & { rank: number })[] {
  const sorted = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

  return sorted.map((player, index) => ({
    ...player,
    rank: index + 1,
  }));
}

/**
 * 기본 가중치 생성
 */
export function getDefaultWeight(): ScoringWeight {
  return {
    id: 'default',
    name: '기본',
    description: '기본 가중치 설정',
    is_default: true,
    weight_points: 1.0,
    weight_rebounds: 1.2,
    weight_assists: 1.5,
    weight_steals: 3.0,
    weight_blocks: 3.0,
    weight_turnovers: -2.0,
    weight_fouls: -1.0,
    weight_fg_percentage: 0.5,
    weight_three_pointers: 0.5,
    weight_ft_percentage: 0.2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * 스탯 비교 (두 선수 또는 두 기간)
 */
export function compareStats(
  stat1: PlayerDailyStat,
  stat2: PlayerDailyStat
): {
  [key: string]: {
    value1: number;
    value2: number;
    diff: number;
    better: 1 | 2 | 0; // 1: stat1이 우수, 2: stat2가 우수, 0: 동일
  };
} {
  const keys: (keyof PlayerDailyStat)[] = [
    'points',
    'rebounds',
    'assists',
    'steals',
    'blocks',
    'turnovers',
    'field_goal_percentage',
  ];

  const comparison: any = {};

  keys.forEach((key) => {
    const val1 = (stat1[key] as number) || 0;
    const val2 = (stat2[key] as number) || 0;
    const diff = val1 - val2;

    let better: 1 | 2 | 0 = 0;
    if (key === 'turnovers') {
      // 턴오버는 적을수록 좋음
      better = val1 < val2 ? 1 : val1 > val2 ? 2 : 0;
    } else {
      better = val1 > val2 ? 1 : val1 < val2 ? 2 : 0;
    }

    comparison[key] = {
      value1: val1,
      value2: val2,
      diff: Math.round(diff * 100) / 100,
      better,
    };
  });

  return comparison;
}
