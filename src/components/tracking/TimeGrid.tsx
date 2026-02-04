import { useState, useEffect, useRef } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { useTimeEntries } from '../../contexts/TimeEntriesContext';
import { generateTimeBlocks, formatTime } from '../../lib/utils';
import { TimeBlockItem } from './TimeBlockItem';
import { LogPrompt } from './LogPrompt';
import { TimeBlock } from '../../types';

export function TimeGrid() {
  const { userProfile } = useAuth();
  const { getEntriesForDateRange } = useTimeEntries();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);
  const [showLogPrompt, setShowLogPrompt] = useState(false);
  const currentBlockRef = useRef<HTMLDivElement>(null);

  const duration = userProfile?.timeBlockDuration || 30;

  const dayStart = new Date(selectedDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(selectedDate);
  dayEnd.setHours(23, 59, 59, 999);

  const entries = getEntriesForDateRange(dayStart, dayEnd);
  const blocks = generateTimeBlocks(selectedDate, duration, entries);

  useEffect(() => {
    if (currentBlockRef.current) {
      currentBlockRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedDate]);

  function handleBlockClick(block: TimeBlock) {
    if (!block.isCurrent && !block.isPast) return;
    setSelectedBlock(block);
    setShowLogPrompt(true);
  }

  function handlePrevDay() {
    setSelectedDate(subDays(selectedDate, 1));
  }

  function handleNextDay() {
    setSelectedDate(addDays(selectedDate, 1));
  }

  function handleToday() {
    setSelectedDate(new Date());
  }

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevDay}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {format(selectedDate, 'EEEE, MMMM d')}
          </h2>
          {!isToday && (
            <button
              onClick={handleToday}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              Today
            </button>
          )}
        </div>

        <button
          onClick={handleNextDay}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="divide-y divide-gray-100">
          {blocks.map((block, index) => {
            const showTimeLabel = index % (60 / duration) === 0;
            const isCurrentBlock = block.isCurrent;

            return (
              <div
                key={block.startTime.toISOString()}
                ref={isCurrentBlock ? currentBlockRef : null}
                className="flex"
              >
                <div className="w-20 flex-shrink-0 py-2 px-3 text-right">
                  {showTimeLabel && (
                    <span className="text-xs text-gray-500">
                      {formatTime(block.startTime)}
                    </span>
                  )}
                </div>
                <TimeBlockItem
                  block={block}
                  categories={userProfile?.categories || []}
                  onClick={() => handleBlockClick(block)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {showLogPrompt && selectedBlock && (
        <LogPrompt
          block={selectedBlock}
          onClose={() => {
            setShowLogPrompt(false);
            setSelectedBlock(null);
          }}
        />
      )}
    </div>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
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
