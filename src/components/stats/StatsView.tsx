import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useTimeEntries } from '../../contexts/TimeEntriesContext';
import { calculateCategoryStats, getTimePeriodDates } from '../../lib/utils';
import { TIME_PERIODS } from '../../lib/constants';
import type { TimePeriod } from '../../types';

function generateColorShades(baseColor: string, count: number): string[] {
  const shades: string[] = [];
  for (let i = 0; i < count; i++) {
    const lightness = 45 + (i * 12);
    const saturation = 70 - (i * 8);
    shades.push(hexToHSLString(baseColor, saturation, lightness));
  }
  return shades;
}

function hexToHSLString(hex: string, saturation: number, lightness: number): string {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  if (max !== min) {
    const d = max - min;
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `hsl(${Math.round(h * 360)}, ${saturation}%, ${lightness}%)`;
}

export function StatsView() {
  const { userProfile } = useAuth();
  const { getEntriesForDateRange } = useTimeEntries();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('1d');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const categories = userProfile?.categories || [];
  const duration = userProfile?.timeBlockDuration || 30;

  const { start, end } = getTimePeriodDates(timePeriod);
  const entries = getEntriesForDateRange(start, end);

  const stats = useMemo(() => {
    return calculateCategoryStats(entries, categories, { start, end }, duration);
  }, [entries, categories, start, end, duration]);

  const totalMinutes = Object.values(stats).reduce((sum, cat) => sum + cat.minutes, 0);

  const pieData = Object.entries(stats)
    .map(([id, data]) => ({
      id,
      name: data.name,
      value: data.minutes,
      color: data.color,
      percentage: totalMinutes > 0 ? (data.minutes / totalMinutes) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const selectedCategory = selectedCategoryId ? stats[selectedCategoryId] : null;

  const subcategoryColors = useMemo(() => {
    if (!selectedCategory) return [];
    const subcatCount = Object.keys(selectedCategory.subcategories).length;
    return generateColorShades(selectedCategory.color, subcatCount);
  }, [selectedCategory]);

  const subcategoryPieData = selectedCategory
    ? Object.entries(selectedCategory.subcategories)
        .map(([id, data], index) => ({
          id,
          name: data.name,
          value: data.minutes,
          color: subcategoryColors[index] || selectedCategory.color,
          percentage: selectedCategory.minutes > 0 ? (data.minutes / selectedCategory.minutes) * 100 : 0,
        }))
        .sort((a, b) => b.value - a.value)
    : [];

  function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }

  return (
    <div className="max-w-lg mx-auto px-5 pt-6 pb-28">
      <h2 className="text-sm font-light text-neutral-700 tracking-wider mb-8">stats</h2>

      {/* Time period selector */}
      <div className="flex gap-2 mb-8">
        {TIME_PERIODS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => {
              setTimePeriod(value as TimePeriod);
              setSelectedCategoryId(null);
            }}
            className={`flex-1 py-2.5 rounded-2xl text-[11px] font-light tracking-wider transition-all duration-500 ${
              timePeriod === value
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-neutral-500 font-light text-xs tracking-wider">no data yet</p>
        </div>
      ) : (
        <>
          {/* Pie Chart */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4 px-1">
              <span className="text-[11px] font-light text-neutral-500 tracking-wider">
                {selectedCategory ? (
                  <button
                    onClick={() => setSelectedCategoryId(null)}
                    className="flex items-center gap-1.5 transition-colors duration-500"
                  >
                    <BackIcon className="w-3 h-3" />
                    <span>{selectedCategory.name}</span>
                  </button>
                ) : (
                  'distribution'
                )}
              </span>
              <span className="text-[11px] text-neutral-500 font-light tracking-wider">
                {formatDuration(selectedCategory?.minutes || totalMinutes)}
              </span>
            </div>

            <div className="h-52 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={selectedCategory ? subcategoryPieData : pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={1}
                    dataKey="value"
                    onClick={(data) => {
                      if (!selectedCategory && data.id) {
                        setSelectedCategoryId(data.id);
                      }
                    }}
                    style={{ cursor: selectedCategory ? 'default' : 'pointer', outline: 'none' }}
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {(selectedCategory ? subcategoryPieData : pieData).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="none"
                        opacity={0.9}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category List */}
          <div className="space-y-1">
            {(selectedCategory ? subcategoryPieData : pieData).map((item, index) => (
              <button
                key={item.id}
                onClick={() => {
                  if (!selectedCategory) {
                    setSelectedCategoryId(item.id);
                  }
                }}
                className={`w-full flex items-center gap-4 px-5 py-4 text-left rounded-2xl transition-all duration-500 animate-slideUp ${
                  selectedCategory ? 'cursor-default' : 'cursor-pointer'
                }`}
                style={{ animationDelay: `${index * 60}ms` }}
                disabled={!!selectedCategory}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0 opacity-85"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-light text-neutral-700 tracking-wide">{item.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-neutral-700 font-light">{formatDuration(item.value)}</p>
                  <p className="text-[11px] text-neutral-500 font-light">{item.percentage.toFixed(0)}%</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}
