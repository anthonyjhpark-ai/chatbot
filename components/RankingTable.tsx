// 선수 랭킹 테이블 컴포넌트
'use client';

interface PlayerRankingData {
  rank: number;
  score: number;
  player: {
    name: string;
    team: string;
    position?: string;
    photo_url?: string;
  };
}

interface RankingTableProps {
  rankings: PlayerRankingData[];
  loading?: boolean;
}

export default function RankingTable({ rankings, loading }: RankingTableProps) {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!rankings || rankings.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-12 text-center">
        <p className="text-gray-400 text-lg">데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                순위
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                선수
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                팀
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                포지션
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                점수
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {rankings.map((item) => (
              <tr
                key={`${item.rank}-${item.player.name}`}
                className="hover:bg-gray-750 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {item.rank <= 3 ? (
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                          item.rank === 1
                            ? 'bg-yellow-500 text-yellow-900'
                            : item.rank === 2
                            ? 'bg-gray-400 text-gray-900'
                            : 'bg-orange-600 text-orange-100'
                        }`}
                      >
                        {item.rank}
                      </span>
                    ) : (
                      <span className="text-gray-400 font-medium">
                        {item.rank}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {item.player.photo_url ? (
                      <img
                        src={item.player.photo_url}
                        alt={item.player.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                        <span className="text-gray-400 font-semibold">
                          {item.player.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className="text-white font-medium">
                      {item.player.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-gray-300">{item.player.team}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-gray-400">
                    {item.player.position || '-'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-2xl font-bold text-blue-400">
                    {item.score.toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
