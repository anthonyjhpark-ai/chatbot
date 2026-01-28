// 가중치 선택 컴포넌트
'use client';

import { useState, useEffect } from 'react';
import { ScoringWeight } from '@/types/nba';

interface WeightSelectorProps {
  selectedWeightId: string;
  onWeightChange: (weightId: string) => void;
}

export default function WeightSelector({
  selectedWeightId,
  onWeightChange,
}: WeightSelectorProps) {
  const [weights, setWeights] = useState<ScoringWeight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    fetchWeights();
  }, []);

  const fetchWeights = async () => {
    try {
      const response = await fetch('/api/weights');
      const data = await response.json();
      if (data.success) {
        setWeights(data.weights);
      }
    } catch (error) {
      console.error('가중치 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 animate-pulse">
        <div className="h-10 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            가중치 설정
          </label>
          <select
            value={selectedWeightId}
            onChange={(e) => onWeightChange(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {weights.map((weight) => (
              <option key={weight.id} value={weight.id}>
                {weight.name}
                {weight.is_default && ' (기본)'}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowEditor(!showEditor)}
          className="mt-7 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          {showEditor ? '닫기' : '편집'}
        </button>
      </div>

      {showEditor && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            가중치 설정 상세
          </h3>
          {weights
            .find((w) => w.id === selectedWeightId)
            ?.description && (
            <p className="text-gray-400 text-sm mb-4">
              {
                weights.find((w) => w.id === selectedWeightId)
                  ?.description
              }
            </p>
          )}
          <div className="grid grid-cols-2 gap-4">
            {selectedWeightId &&
              (() => {
                const selectedWeight = weights.find(
                  (w) => w.id === selectedWeightId
                );
                if (!selectedWeight) return null;

                const weightFields = [
                  { key: 'weight_points', label: '득점' },
                  { key: 'weight_rebounds', label: '리바운드' },
                  { key: 'weight_assists', label: '어시스트' },
                  { key: 'weight_steals', label: '스틸' },
                  { key: 'weight_blocks', label: '블록' },
                  { key: 'weight_turnovers', label: '턴오버' },
                  { key: 'weight_fouls', label: '파울' },
                  { key: 'weight_fg_percentage', label: 'FG%' },
                  { key: 'weight_three_pointers', label: '3점슛' },
                  { key: 'weight_ft_percentage', label: 'FT%' },
                ];

                return weightFields.map((field) => (
                  <div key={field.key} className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">
                      {field.label}
                    </span>
                    <span
                      className={`font-semibold ${
                        selectedWeight[field.key as keyof ScoringWeight] as number > 0
                          ? 'text-green-400'
                          : (selectedWeight[field.key as keyof ScoringWeight] as number) < 0
                          ? 'text-red-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {selectedWeight[field.key as keyof ScoringWeight]}
                    </span>
                  </div>
                ));
              })()}
          </div>
        </div>
      )}
    </div>
  );
}
