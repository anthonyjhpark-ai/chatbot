// API Route: 점수 계산
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { calculateScore } from '@/lib/scoring';
import { ScoringWeight, PlayerDailyStat } from '@/types/nba';

/**
 * POST /api/stats/calculate
 * 저장된 스탯에 대해 가중치를 적용하여 점수 계산
 */
export async function POST(request: NextRequest) {
  try {
    const { date, weightId } = await request.json();
    const supabase = createClient();

    // 가중치 정보 가져오기
    const { data: weight, error: weightError } = await supabase
      .from('scoring_weights')
      .select('*')
      .eq('id', weightId || '')
      .single();

    if (weightError || !weight) {
      // 기본 가중치 사용
      const { data: defaultWeight } = await supabase
        .from('scoring_weights')
        .select('*')
        .eq('is_default', true)
        .single();

      if (!defaultWeight) {
        return NextResponse.json(
          { error: '가중치를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
    }

    const selectedWeight = weight as ScoringWeight;

    // 해당 날짜의 모든 스탯 가져오기
    const { data: stats, error: statsError } = await supabase
      .from('player_daily_stats')
      .select('*')
      .eq('game_date', date || new Date().toISOString().split('T')[0]);

    if (statsError) {
      return NextResponse.json(
        { error: '스탯을 가져오는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    const calculatedScores = [];

    // 각 스탯에 대해 점수 계산
    for (const stat of stats as PlayerDailyStat[]) {
      const score = calculateScore(stat, selectedWeight);

      // 점수 저장
      const { data: savedScore, error: scoreError } = await supabase
        .from('player_scores')
        .upsert(
          {
            player_id: stat.player_id,
            weight_id: selectedWeight.id,
            game_date: stat.game_date,
            score,
          },
          {
            onConflict: 'player_id,weight_id,game_date',
          }
        )
        .select()
        .single();

      if (!scoreError && savedScore) {
        calculatedScores.push(savedScore);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${calculatedScores.length}개의 점수가 계산되었습니다.`,
      scores: calculatedScores,
    });
  } catch (error) {
    console.error('점수 계산 오류:', error);
    return NextResponse.json(
      { error: '점수 계산 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stats/calculate
 * 자동으로 오늘 날짜의 점수 계산
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    // 기본 가중치 가져오기
    const { data: defaultWeight } = await supabase
      .from('scoring_weights')
      .select('*')
      .eq('is_default', true)
      .single();

    if (!defaultWeight) {
      return NextResponse.json(
        { error: '기본 가중치를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // POST 메서드 재사용
    return POST(
      new NextRequest(request.url, {
        method: 'POST',
        body: JSON.stringify({
          date: today,
          weightId: defaultWeight.id,
        }),
      })
    );
  } catch (error) {
    console.error('자동 점수 계산 오류:', error);
    return NextResponse.json(
      { error: '자동 점수 계산 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
