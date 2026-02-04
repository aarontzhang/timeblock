import { startOfDay, addMinutes, format, isWithinInterval } from 'date-fns';
import { TimeBlock, TimeBlockDuration, TimeEntry } from '../types';

export function generateTimeBlocks(
  date: Date,
  duration: TimeBlockDuration,
  entries: TimeEntry[]
): TimeBlock[] {
  const blocks: TimeBlock[] = [];
  const dayStart = startOfDay(date);
  const now = new Date();
  const blocksPerDay = (24 * 60) / duration;

  for (let i = 0; i < blocksPerDay; i++) {
    const startTime = addMinutes(dayStart, i * duration);
    const endTime = addMinutes(startTime, duration);

    const entry = entries.find((e) => {
      const entryStart = e.startTime.toDate();
      return isWithinInterval(entryStart, { start: startTime, end: addMinutes(endTime, -1) });
    });

    const isCurrent = isWithinInterval(now, { start: startTime, end: endTime });
    const isPast = endTime < now;

    blocks.push({
      startTime,
      endTime,
      entry,
      isCurrent,
      isPast,
    });
  }

  return blocks;
}

export function formatTime(date: Date): string {
  return format(date, 'h:mm a');
}

export function formatTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

export function getDurationLabel(minutes: TimeBlockDuration): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  return `${minutes / 60} hr`;
}

export function getTimePeriodDates(period: string): { start: Date; end: Date } {
  const now = new Date();
  const end = now;
  let start: Date;

  switch (period) {
    case '1d':
      start = startOfDay(now);
      break;
    case '3d':
      start = startOfDay(addMinutes(now, -3 * 24 * 60));
      break;
    case '1w':
      start = startOfDay(addMinutes(now, -7 * 24 * 60));
      break;
    case '1m':
      start = startOfDay(addMinutes(now, -30 * 24 * 60));
      break;
    default:
      start = startOfDay(now);
  }

  return { start, end };
}

export function calculateCategoryStats(
  entries: TimeEntry[],
  categories: { id: string; name: string; color: string; subcategories: { id: string; name: string }[] }[]
) {
  const stats: Record<string, { name: string; color: string; minutes: number; subcategories: Record<string, { name: string; minutes: number }> }> = {};

  for (const entry of entries) {
    const category = categories.find((c) => c.id === entry.categoryId);
    if (!category) continue;

    const entryMinutes =
      (entry.endTime.toDate().getTime() - entry.startTime.toDate().getTime()) / (1000 * 60);

    if (!stats[entry.categoryId]) {
      stats[entry.categoryId] = {
        name: category.name,
        color: category.color,
        minutes: 0,
        subcategories: {},
      };
    }

    stats[entry.categoryId].minutes += entryMinutes;

    const subcategory = category.subcategories.find((s) => s.id === entry.subcategoryId);
    const subcategoryName = subcategory?.name || entry.customSubcategory || 'Other';
    const subcategoryKey = entry.subcategoryId || 'custom';

    if (!stats[entry.categoryId].subcategories[subcategoryKey]) {
      stats[entry.categoryId].subcategories[subcategoryKey] = {
        name: subcategoryName,
        minutes: 0,
      };
    }

    stats[entry.categoryId].subcategories[subcategoryKey].minutes += entryMinutes;
  }

  return stats;
}
