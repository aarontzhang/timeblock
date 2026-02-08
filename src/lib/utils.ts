import { startOfDay, addMinutes, format, isWithinInterval } from 'date-fns';
import type { TimeBlock, TimeBlockDuration, TimeEntry, CategorySelection } from '../types';

// Helper to get categories from entry (handles both old and new format)
function getEntryCategories(entry: TimeEntry): CategorySelection[] {
  if (entry.categories && entry.categories.length > 0) {
    return entry.categories;
  }
  // Legacy format
  if (entry.categoryId) {
    return [{
      categoryId: entry.categoryId,
      subcategoryId: entry.subcategoryId || undefined,
      customSubcategory: entry.customSubcategory,
    }];
  }
  return [];
}

export function generateTimeBlocks(
  date: Date,
  duration: TimeBlockDuration,
  entries: TimeEntry[]
): TimeBlock[] {
  const blocks: TimeBlock[] = [];
  const dayStart = startOfDay(date);
  const now = new Date();
  const blocksPerDay = (24 * 60) / duration;

  // First pass: create blocks with direct entries
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
      isContinued: false,
    });
  }

  // Second pass: fill empty blocks with continued entries from previous blocks
  let lastEntry: TimeEntry | undefined;
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].entry) {
      lastEntry = blocks[i].entry;
    } else if (lastEntry && blocks[i].isPast) {
      // Only continue for past blocks, not current or future
      blocks[i].entry = lastEntry;
      blocks[i].isContinued = true;
    }
  }

  return blocks;
}

export function formatTime(date: Date): string {
  return format(date, 'h:mm a');
}

export function formatTimeShort(date: Date): string {
  const hours = date.getHours();
  const ampm = hours >= 12 ? 'p' : 'a';
  const hour12 = hours % 12 || 12;
  return `${hour12}${ampm}`;
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
  categories: { id: string; name: string; color: string; subcategories: { id: string; name: string }[] }[],
  dateRange: { start: Date; end: Date },
  duration: TimeBlockDuration
) {
  const stats: Record<string, { name: string; color: string; minutes: number; subcategories: Record<string, { name: string; minutes: number }> }> = {};

  // Generate blocks for each day in the range to account for continuations
  const currentDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);

  while (currentDate <= endDate) {
    const dayStart = startOfDay(currentDate);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    // Get entries for this day
    const dayEntries = entries.filter((e) => {
      const entryStart = e.startTime.toDate();
      return entryStart >= dayStart && entryStart <= dayEnd;
    });

    // Generate blocks with continuation logic for this day
    const blocks = generateTimeBlocks(currentDate, duration, dayEntries);

    // Count stats from blocks (including continued ones)
    for (const block of blocks) {
      if (!block.entry || !block.isPast) continue;

      const selections = getEntryCategories(block.entry);
      if (selections.length === 0) continue;

      // Distribute time evenly among all selected categories
      const minutesPerCategory = duration / selections.length;

      for (const selection of selections) {
        const category = categories.find((c) => c.id === selection.categoryId);
        if (!category) continue;

        // For "Other" category, use custom text as a unique entry
        const isOther = selection.categoryId === 'default-other';
        const statsKey = isOther && selection.customSubcategory
          ? `other-${selection.customSubcategory}`
          : selection.categoryId;
        const displayName = isOther && selection.customSubcategory
          ? selection.customSubcategory
          : category.name;

        if (!stats[statsKey]) {
          stats[statsKey] = {
            name: displayName,
            color: category.color,
            minutes: 0,
            subcategories: {},
          };
        }

        stats[statsKey].minutes += minutesPerCategory;

        // Skip subcategory tracking for "Other" entries with custom text
        if (isOther && selection.customSubcategory) continue;

        const subcategory = category.subcategories.find((s) => s.id === selection.subcategoryId);
        const subcategoryName = subcategory?.name || selection.customSubcategory || 'General';
        const subcategoryKey = selection.subcategoryId || 'general';

        if (!stats[statsKey].subcategories[subcategoryKey]) {
          stats[statsKey].subcategories[subcategoryKey] = {
            name: subcategoryName,
            minutes: 0,
          };
        }

        stats[statsKey].subcategories[subcategoryKey].minutes += minutesPerCategory;
      }
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return stats;
}
