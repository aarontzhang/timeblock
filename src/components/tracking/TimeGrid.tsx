import { useState, useEffect, useRef, useCallback } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { useTimeEntries } from '../../contexts/TimeEntriesContext';
import { generateTimeBlocks, formatTime } from '../../lib/utils';
import { TimeBlockItem } from './TimeBlockItem';
import { LogPrompt } from './LogPrompt';
import type { TimeBlock } from '../../types';

export function TimeGrid() {
  const { userProfile } = useAuth();
  const { getEntriesForDateRange } = useTimeEntries();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);
  const [showLogPrompt, setShowLogPrompt] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const currentBlockRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);

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

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      isSwiping.current = true;
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isSwiping.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const threshold = 80;
    if (deltaX > threshold) {
      setSwipeDirection('right');
      setTimeout(() => {
        setSelectedDate(prev => subDays(prev, 1));
        setSwipeDirection(null);
      }, 200);
    } else if (deltaX < -threshold) {
      setSwipeDirection('left');
      setTimeout(() => {
        setSelectedDate(prev => addDays(prev, 1));
        setSwipeDirection(null);
      }, 200);
    }
    touchStartX.current = 0;
    touchStartY.current = 0;
    isSwiping.current = false;
  }, []);

  function handleBlockClick(block: TimeBlock) {
    if (!block.isCurrent && !block.isPast) return;
    setSelectedBlock(block);
    setShowLogPrompt(true);
  }

  function handlePrevDay() {
    setSwipeDirection('right');
    setTimeout(() => {
      setSelectedDate(subDays(selectedDate, 1));
      setSwipeDirection(null);
    }, 200);
  }

  function handleNextDay() {
    setSwipeDirection('left');
    setTimeout(() => {
      setSelectedDate(addDays(selectedDate, 1));
      setSwipeDirection(null);
    }, 200);
  }

  function handleToday() {
    setSelectedDate(new Date());
  }

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="max-w-lg mx-auto px-5 pt-6 pb-28">
      {/* Date Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={handlePrevDay}
          className="p-3 text-neutral-500 transition-colors duration-500"
          aria-label="Previous day"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center">
          <h2 className="text-sm font-light text-neutral-700 tracking-wider">
            {isToday ? 'Today' : format(selectedDate, 'EEEE')}
          </h2>
          <p className="text-xs text-neutral-500 font-light mt-1">
            {format(selectedDate, 'MMMM d')}
          </p>
          {!isToday && (
            <button
              onClick={handleToday}
              className="mt-3 text-[11px] text-neutral-600 font-light tracking-wider transition-colors duration-500"
            >
              today
            </button>
          )}
        </div>

        <button
          onClick={handleNextDay}
          className="p-3 text-neutral-500 transition-colors duration-500"
          aria-label="Next day"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Time blocks */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`rounded-3xl overflow-hidden transition-all duration-500 ${
          swipeDirection === 'left' ? 'opacity-30 -translate-x-3' :
          swipeDirection === 'right' ? 'opacity-30 translate-x-3' : ''
        }`}
      >
        <div className="space-y-px">
          {blocks.map((block, index) => {
            const showTimeLabel = index % (60 / duration) === 0;
            const isCurrentBlock = block.isCurrent;

            return (
              <div
                key={block.startTime.toISOString()}
                ref={isCurrentBlock ? currentBlockRef : null}
                className="flex animate-fadeIn"
                style={{ animationDelay: `${Math.min(index * 15, 300)}ms` }}
              >
                <div className="w-16 flex-shrink-0 py-4 pr-4 text-right flex items-center justify-end">
                  {showTimeLabel && (
                    <span className="text-[11px] text-neutral-500 font-light whitespace-nowrap">
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
          key={selectedBlock.startTime.toISOString()}
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
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}
