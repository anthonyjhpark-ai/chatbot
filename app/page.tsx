// NBA 선수 시즌 스탯 대시보드
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PlayerSeasonStat {
  id: string;
  season: string;
  games_played: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  field_goal_percentage: number;
  three_pointers_made: number;
  three_point_percentage: number;
  free_throw_percentage: number;
  offensive_rebounds: number;
  double_doubles: number;
  triple_doubles: number;
  nba_players: {
    name: string;
    team: string;
    position: string;
  };
}

export default function HomePage() {
  const [players, setPlayers] = useState<PlayerSeasonStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'points' | 'rebounds' | 'assists'>('points');
  const [currentSeason, setCurrentSeason] = useState('2025-26');

  useEffect(() => {
    fetchPlayers();
  }, [sortBy, currentSeason]);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('player_season_stats')
        .select(`
          *,
          nba_players (
            name,
            team,
            position
          )
        `)
        .eq('season', currentSeason)
        .order(sortBy, { ascending: false })
        .limit(100);

      if (error) {
        console.error('데이터 조회 오류:', error);
      } else {
        setPlayers(data || []);
      }
    } catch (error) {
      console.error('데이터 가져오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter((player) =>
    player.nba_players?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.nba_players?.team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topScorer = players[0];
  const avgPoints = players.length > 0
    ? (players.reduce((sum, p) => sum + p.points, 0) / players.length).toFixed(1)
    : 0;
  const topAssists = [...players].sort((a, b) => b.assists - a.assists)[0];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 헤더 */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                🏀 NBA 선수 스탯 대시보드
              </h1>
              <p className="text-gray-400 mt-1">
                {currentSeason} 시즌 평균 통계
              </p>
            </div>
            <button
              onClick={fetchPlayers}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? '로딩 중...' : '새로고침'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-2">전체 선수</p>
                <p className="text-3xl font-bold text-white">{players.length}</p>
                <p className="text-gray-500 text-sm mt-1">명</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-2">최고 득점자</p>
                <p className="text-2xl font-bold text-white">
                  {topScorer?.nba_players?.name || '-'}
                </p>
                <p className="text-green-400 text-lg font-semibold mt-1">
                  {topScorer?.points.toFixed(1)} 점
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-2">평균 득점</p>
                <p className="text-3xl font-bold text-white">{avgPoints}</p>
                <p className="text-gray-500 text-sm mt-1">경기당</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                선수 검색
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="선수명 또는 팀명 입력..."
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                정렬 기준
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="points">득점</option>
                <option value="rebounds">리바운드</option>
                <option value="assists">어시스트</option>
              </select>
            </div>
          </div>
        </div>

        {/* 선수 테이블 */}
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">데이터를 불러오는 중...</p>
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 text-lg">데이터가 없습니다.</p>
              <p className="text-gray-500 text-sm mt-2">
                fetch_nba_stats.py를 실행하여 데이터를 수집하세요.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">순위</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">선수명</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">팀</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">경기</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">득점</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">리바운드</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">어시스트</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">스틸</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">블록</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">FG%</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">3P</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">DD</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">TD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredPlayers.map((player, index) => (
                    <tr
                      key={player.id}
                      className="hover:bg-gray-750 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {index <= 2 ? (
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                              index === 0
                                ? 'bg-yellow-500 text-yellow-900'
                                : index === 1
                                ? 'bg-gray-400 text-gray-900'
                                : 'bg-orange-600 text-orange-100'
                            }`}
                          >
                            {index + 1}
                          </span>
                        ) : (
                          <span className="text-gray-400 font-medium">{index + 1}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white font-medium">
                          {player.nba_players?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">
                          {player.nba_players?.team || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-300">
                        {player.games_played}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-green-400 font-bold text-lg">
                          {player.points.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-300">
                        {player.rebounds.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-300">
                        {player.assists.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-300">
                        {player.steals.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-300">
                        {player.blocks.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-300">
                        {player.field_goal_percentage.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-300">
                        {player.three_pointers_made.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {player.double_doubles > 0 && (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded">
                            {player.double_doubles}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {player.triple_doubles > 0 && (
                          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-semibold rounded">
                            {player.triple_doubles}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 푸터 정보 */}
        {!loading && filteredPlayers.length > 0 && (
          <div className="mt-6 text-center text-gray-400 text-sm">
            <p>
              총 {filteredPlayers.length}명의 선수 표시 중
              {searchTerm && ` (${players.length}명 중 필터링됨)`}
            </p>
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-400 text-sm">
            NBA 선수 스탯 대시보드 © 2026 - {currentSeason} 시즌 데이터
          </p>
        </div>
      </footer>
    </div>
  );
}
