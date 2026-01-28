// 통계 카드 컴포넌트
'use client';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
}: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          {subtitle && (
            <p className="text-gray-500 text-sm">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-3 flex items-center">
              <span
                className={`text-sm font-medium ${
                  trend.value > 0
                    ? 'text-green-400'
                    : trend.value < 0
                    ? 'text-red-400'
                    : 'text-gray-400'
                }`}
              >
                {trend.value > 0 ? '↑' : trend.value < 0 ? '↓' : '→'}{' '}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-gray-500 text-sm ml-2">
                {trend.label}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={`p-3 rounded-lg border ${colorClasses[color]}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
