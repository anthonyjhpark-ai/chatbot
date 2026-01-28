// 날짜 선택 컴포넌트
'use client';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function DateSelector({
  selectedDate,
  onDateChange,
}: DateSelectorProps) {
  const today = new Date().toISOString().split('T')[0];

  const handlePreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const date = new Date(selectedDate);
    const nextDate = new Date(date.setDate(date.getDate() + 1));
    if (nextDate <= new Date()) {
      onDateChange(nextDate.toISOString().split('T')[0]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handlePreviousDay}
        className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <div className="flex-1">
        <input
          type="date"
          value={selectedDate}
          max={today}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={handleNextDay}
        disabled={selectedDate >= today}
        className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {selectedDate === today && (
        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-full">
          오늘
        </span>
      )}
    </div>
  );
}
