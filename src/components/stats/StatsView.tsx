import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useTimeEntries } from '../../contexts/TimeEntriesContext';
import { calculateCategoryStats, getTimePeriodDates } from '../../lib/utils';
import { TIME_PERIODS } from '../../lib/constants';
import type { TimePeriod } from '../../types';

export function StatsView() {
  const { userProfile } = useAuth();
  const { getEntriesForDateRange } = useTimeEntries();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('1d');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const categories = userProfile?.categories || [];

  const { start, end } = getTimePeriodDates(timePeriod);
  const entries = getEntriesForDateRange(start, end);

  const stats = useMemo(() => {
    return calculateCategoryStats(entries, categories);
  }, [entries, categories]);

  const totalMinutes = Object.values(stats).reduce((sum, cat) => sum + cat.minutes, 0);

  const pieData = Object.entries(stats).map(([id, data]) => ({
    id,
    name: data.name,
    value: data.minutes,
    color: data.color,
    percentage: totalMinutes > 0 ? (data.minutes / totalMinutes) * 100 : 0,
  }));

  const selectedCategory = selectedCategoryId ? stats[selectedCategoryId] : null;
  const subcategoryPieData = selectedCategory
    ? Object.entries(selectedCategory.subcategories).map(([id, data]) => ({
        id,
        name: data.name,
        value: data.minutes,
        color: selectedCategory.color,
        percentage: selectedCategory.minutes > 0 ? (data.minutes / selectedCategory.minutes) * 100 : 0,
      }))
    : [];

  function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistics</h2>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TIME_PERIODS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => {
              setTimePeriod(value as TimePeriod);
              setSelectedCategoryId(null);
            }}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
              timePeriod === value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No time entries for this period</p>
          <p className="text-sm text-gray-400 mt-1">
            Start logging your time blocks to see statistics
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">
                {selectedCategory ? (
                  <button
                    onClick={() => setSelectedCategoryId(null)}
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
                  >
                    <BackIcon className="w-4 h-4" />
                    {selectedCategory.name}
                  </button>
                ) : (
                  'Time by Category'
                )}
              </h3>
              <span className="text-sm text-gray-500">
                Total: {formatDuration(selectedCategory?.minutes || totalMinutes)}
              </span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={selectedCategory ? subcategoryPieData : pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    onClick={(data) => {
                      if (!selectedCategory && data.id) {
                        setSelectedCategoryId(data.id);
                      }
                    }}
                    style={{ cursor: selectedCategory ? 'default' : 'pointer' }}
                  >
                    {(selectedCategory ? subcategoryPieData : pieData).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        opacity={selectedCategory ? 0.7 + (index * 0.1) : 1}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatDuration(value as number)}
                    labelFormatter={(name) => name}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">
                {selectedCategory ? 'Subcategories' : 'Categories'}
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {(selectedCategory ? subcategoryPieData : pieData).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (!selectedCategory) {
                      setSelectedCategoryId(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 p-4 text-left ${
                    selectedCategory ? '' : 'hover:bg-gray-50'
                  }`}
                  disabled={!!selectedCategory}
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatDuration(item.value)} ({item.percentage.toFixed(1)}%)
                    </p>
                  </div>
                  {!selectedCategory && (
                    <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function BackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
