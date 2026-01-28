// API Route: 스탯 수집 및 저장
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { fetchTodayStats, transformAPIStatToInternal } from '@/lib/nba-api';

/**
 * GET /api/stats/collect
 * 오늘의 NBA 스탯을 수집하여 데이터베이스에 저장
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // 1. 외부 NBA API에서 오늘의 스탯 가져오기
    const games = await fetchTodayStats();

    if (!games || games.length === 0) {
      return NextResponse.json(
        { message: '오늘 진행된 경기가 없습니다.' },
        { status: 200 }
      );
    }

    const savedStats = [];

    // 2. 각 경기의 스탯을 데이터베이스에 저장
    for (const game of games) {
      // 게임 데이터에서 선수 스탯 추출 (API 구조에 따라 수정 필요)
      const playerStats = game.PlayerStats || [];

      for (const apiStat of playerStats) {
        // 선수 존재 여부 확인
        const { data: existingPlayer } = await supabase
          .from('nba_players')
          .select('id')
          .eq('player_id', apiStat.PlayerID)
          .single();

        let playerId = existingPlayer?.id;

        // 선수가 없으면 추가
        if (!playerId) {
          const { data: newPlayer, error: playerError } = await supabase
            .from('nba_players')
            .insert({
              player_id: apiStat.PlayerID,
              name: apiStat.Name,
              team: apiStat.Team,
              position: apiStat.Position,
              jersey_number: apiStat.Jersey,
            })
            .select()
            .single();

          if (playerError) {
            console.error('선수 추가 실패:', playerError);
            continue;
          }

          playerId = newPlayer.id;
        }

        // 스탯 저장
        const statData = transformAPIStatToInternal(apiStat);
        const { data: savedStat, error: statError } = await supabase
          .from('player_daily_stats')
          .upsert(
            {
              player_id: playerId,
              ...statData,
            },
            {
              onConflict: 'player_id,game_date',
            }
          )
          .select()
          .single();

        if (statError) {
          console.error('스탯 저장 실패:', statError);
          continue;
        }

        savedStats.push(savedStat);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${savedStats.length}개의 스탯이 저장되었습니다.`,
      stats: savedStats,
    });
  } catch (error) {
    console.error('스탯 수집 오류:', error);
    return NextResponse.json(
      { error: '스탯 수집 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
