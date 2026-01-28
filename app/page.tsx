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
  
  // 현재 NBA 시즌 자동 계산
  const getCurrentNBASeason = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 0-based이므로 +1
    
    // NBA 시즌은 10월에 시작
    // 1월~6월: 전년도 시즌, 10월~12월: 현재 연도 시즌
    if (currentMonth >= 10) {
      return `${currentYear}-${String(currentYear + 1).slice(-2)}`;
    } else if (currentMonth <= 6) {
      return `${currentYear - 1}-${String(currentYear).slice(-2)}`;
    } else {
      // 7월~9월 오프시즌: 다음 시즌 사용
      return `${currentYear}-${String(currentYear + 1).slice(-2)}`;
    }
  };
  
  const [currentSeason] = useState(getCurrentNBASeason());

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

  // 가중치 설정
  const WEIGHTS = {
    points: 1.3,
    rebounds: 0.7,
    assists: 1.95,
    threePointers: 1.35
  };

  // 총점 계산 함수
  const calculateTotalScore = (player: PlayerSeasonStat) => {
    const score =
      player.points * WEIGHTS.points +
      player.rebounds * WEIGHTS.rebounds +
      player.assists * WEIGHTS.assists +
      player.three_pointers_made * WEIGHTS.threePointers;
    return score;
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
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                🏀 NBA 선수 스탯 대시보드
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {currentSeason} 시즌 • 전체 {players.length}명
              </p>
            </div>
            <button
              onClick={fetchPlayers}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? '로딩 중...' : '새로고침'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 필터 및 검색 */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                선수 검색
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="선수명 또는 팀명 입력..."
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                정렬 기준
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase">순위</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase">선수명</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase">팀</th>
                    <th className="px-3 py-4 text-center text-xs font-semibold text-gray-400 uppercase">경기</th>
                    
                    {/* 득점 그룹 */}
                    <th className="px-6 py-4 text-center text-xs font-semibold text-green-400 uppercase border-l-2 border-gray-700">
                      득점<br/><span className="text-gray-500 text-[10px]">(×1.3)</span>
                    </th>
                    
                    {/* 리바운드 그룹 */}
                    <th className="px-6 py-4 text-center text-xs font-semibold text-blue-400 uppercase border-l-2 border-gray-700">
                      리바운드<br/><span className="text-gray-500 text-[10px]">(×0.7)</span>
                    </th>
                    
                    {/* 어시스트 그룹 */}
                    <th className="px-6 py-4 text-center text-xs font-semibold text-purple-400 uppercase border-l-2 border-gray-700">
                      어시스트<br/><span className="text-gray-500 text-[10px]">(×1.95)</span>
                    </th>
                    
                    {/* 3점 그룹 */}
                    <th className="px-6 py-4 text-center text-xs font-semibold text-orange-400 uppercase border-l-2 border-gray-700">
                      3점<br/><span className="text-gray-500 text-[10px]">(×1.35)</span>
                    </th>
                    
                    {/* 기타 스탯 */}
                    <th className="px-3 py-4 text-center text-xs font-semibold text-gray-400 uppercase border-l-2 border-gray-700">스틸</th>
                    <th className="px-3 py-4 text-center text-xs font-semibold text-gray-400 uppercase">블록</th>
                    <th className="px-3 py-4 text-center text-xs font-semibold text-gray-400 uppercase">FG%</th>
                    <th className="px-3 py-4 text-center text-xs font-semibold text-gray-400 uppercase">DD</th>
                    <th className="px-3 py-4 text-center text-xs font-semibold text-gray-400 uppercase">TD</th>
                    
                    {/* 총점 */}
                    <th className="px-6 py-4 text-center text-xs font-semibold text-yellow-400 uppercase border-l-4 border-yellow-600">
                      총점
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredPlayers.map((player, index) => {
                    const totalScore = calculateTotalScore(player);
                    return (
                      <tr
                        key={player.id}
                        className="hover:bg-gray-750 transition-colors"
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
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
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-white font-medium">
                            {player.nba_players?.name || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">
                            {player.nba_players?.team || 'N/A'}
                          </span>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-center text-gray-300 text-sm">
                          {player.games_played}
                        </td>
                        
                        {/* 득점 (가중치 적용) */}
                        <td className="px-6 py-4 whitespace-nowrap text-center border-l-2 border-gray-700">
                          <span className="text-green-400 font-bold text-lg">
                            {player.points.toFixed(1)}
                          </span>
                        </td>
                        
                        {/* 리바운드 (가중치 적용) */}
                        <td className="px-6 py-4 whitespace-nowrap text-center border-l-2 border-gray-700">
                          <span className="text-blue-400 font-bold text-lg">
                            {player.rebounds.toFixed(1)}
                          </span>
                        </td>
                        
                        {/* 어시스트 (가중치 적용) */}
                        <td className="px-6 py-4 whitespace-nowrap text-center border-l-2 border-gray-700">
                          <span className="text-purple-400 font-bold text-lg">
                            {player.assists.toFixed(1)}
                          </span>
                        </td>
                        
                        {/* 3점 (가중치 적용) */}
                        <td className="px-6 py-4 whitespace-nowrap text-center border-l-2 border-gray-700">
                          <span className="text-orange-400 font-bold text-lg">
                            {player.three_pointers_made.toFixed(1)}
                          </span>
                        </td>
                        
                        {/* 기타 스탯 */}
                        <td className="px-3 py-4 whitespace-nowrap text-center text-gray-300 text-sm border-l-2 border-gray-700">
                          {player.steals.toFixed(1)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-center text-gray-300 text-sm">
                          {player.blocks.toFixed(1)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-center text-gray-300 text-sm">
                          {player.field_goal_percentage.toFixed(1)}%
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-center text-sm">
                          {player.double_doubles > 0 && (
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded">
                              {player.double_doubles}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-center text-sm">
                          {player.triple_doubles > 0 && (
                            <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-semibold rounded">
                              {player.triple_doubles}
                            </span>
                          )}
                        </td>
                        
                        {/* 총점 */}
                        <td className="px-6 py-4 whitespace-nowrap text-center border-l-4 border-yellow-600 bg-yellow-900/10">
                          <span className="text-yellow-400 font-black text-xl">
                            {totalScore.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
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
