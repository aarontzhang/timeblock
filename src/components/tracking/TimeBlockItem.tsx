import type { TimeBlock, Category, CategorySelection } from '../../types';

interface TimeBlockItemProps {
  block: TimeBlock;
  categories: Category[];
  onClick: () => void;
}

function getEntryCategories(entry: TimeBlock['entry']): CategorySelection[] {
  if (!entry) return [];
  if (entry.categories && entry.categories.length > 0) {
    return entry.categories;
  }
  if (entry.categoryId) {
    return [{
      categoryId: entry.categoryId,
      subcategoryId: entry.subcategoryId || undefined,
      customSubcategory: entry.customSubcategory,
    }];
  }
  return [];
}

export function TimeBlockItem({ block, categories, onClick }: TimeBlockItemProps) {
  const selections = getEntryCategories(block.entry);

  const isClickable = block.isCurrent || block.isPast;
  const isLogged = selections.length > 0;
  const isContinued = block.isContinued;

  const selectedCategories = selections.map(sel => {
    const category = categories.find(c => c.id === sel.categoryId);
    const subcategory = category?.subcategories.find(s => s.id === sel.subcategoryId);
    return {
      category,
      subcategory,
      customSubcategory: sel.customSubcategory,
    };
  }).filter(item => item.category);

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={`flex-1 py-5 px-5 min-h-[72px] flex items-center transition-all duration-500 rounded-2xl ${
        block.isCurrent ? 'bg-white' : isLogged ? 'bg-white/60' : ''
      } ${isContinued ? 'opacity-55' : ''} ${isClickable ? 'cursor-pointer' : ''}`}
    >
      {isLogged ? (
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex gap-[3px] flex-shrink-0">
            {selectedCategories.slice(0, 3).map((item, i) => (
              <div
                key={i}
                className="w-[3px] h-7 rounded-full opacity-85"
                style={{ backgroundColor: item.category?.color || '#a3a3a3' }}
              />
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-light tracking-wide ${isContinued ? 'text-neutral-400' : 'text-neutral-600'}`}>
              {selectedCategories.map(item => item.category?.name).join(' + ')}
            </p>
            <p className="text-[10px] text-neutral-400 font-light tracking-wide mt-0.5">
              {selectedCategories.length === 1
                ? (selectedCategories[0].subcategory?.name || selectedCategories[0].customSubcategory || '')
                : `${selectedCategories.length} activities`
              }
              {isContinued && ' · continued'}
            </p>
          </div>
          {block.entry?.note && !isContinued && (
            <NoteIcon className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
          )}
        </div>
      ) : block.isPast ? (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <div className="w-[3px] h-7 rounded-full bg-neutral-100" />
            <span className="text-[10px] font-light tracking-wide text-neutral-400">empty</span>
          </div>
        </div>
      ) : block.isCurrent ? (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <div className="w-[3px] h-7 rounded-full bg-neutral-400 animate-gentle-pulse" />
            <span className="text-xs font-light text-neutral-500 tracking-wide">now</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 text-neutral-300">
          <div className="w-[3px] h-7 rounded-full bg-neutral-200/60" />
        </div>
      )}
    </div>
  );
}

function NoteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  );
}
