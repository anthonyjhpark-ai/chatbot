// API Route: 선수 랭킹 조회
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * GET /api/rankings?date=2024-01-01&weightId=uuid&limit=50
 * 특정 날짜의 선수 랭킹 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const weightId = searchParams.get('weightId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabase = createClient();

    // 가중치 확인
    let selectedWeightId = weightId;
    if (!selectedWeightId) {
      const { data: defaultWeight } = await supabase
        .from('scoring_weights')
        .select('id')
        .eq('is_default', true)
        .single();

      selectedWeightId = defaultWeight?.id;
    }

    if (!selectedWeightId) {
      return NextResponse.json(
        { error: '가중치를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 랭킹 조회 (player_scores + nba_players 조인)
    const { data: rankings, error } = await supabase
      .from('player_scores')
      .select(`
        score,
        game_date,
        player:nba_players (
          name,
          team,
          position,
          photo_url
        ),
        weight:scoring_weights (
          name
        )
      `)
      .eq('game_date', date)
      .eq('weight_id', selectedWeightId)
      .order('score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('랭킹 조회 오류:', error);
      return NextResponse.json(
        { error: '랭킹을 조회하는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 랭킹 번호 추가
    const rankedData = rankings?.map((item, index) => ({
      rank: index + 1,
      ...item,
    }));

    return NextResponse.json({
      success: true,
      date,
      rankings: rankedData,
    });
  } catch (error) {
    console.error('랭킹 조회 오류:', error);
    return NextResponse.json(
      { error: '랭킹 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
