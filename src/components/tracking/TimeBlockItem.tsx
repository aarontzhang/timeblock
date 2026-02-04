import { TimeBlock, Category } from '../../types';

interface TimeBlockItemProps {
  block: TimeBlock;
  categories: Category[];
  onClick: () => void;
}

export function TimeBlockItem({ block, categories, onClick }: TimeBlockItemProps) {
  const category = block.entry
    ? categories.find((c) => c.id === block.entry?.categoryId)
    : null;

  const subcategory = category
    ? category.subcategories.find((s) => s.id === block.entry?.subcategoryId)
    : null;

  const isClickable = block.isCurrent || block.isPast;
  const isLogged = !!block.entry;

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={`flex-1 py-2 px-3 min-h-[48px] border-l border-gray-200 transition-colors ${
        isClickable ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed opacity-50'
      } ${block.isCurrent ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''}`}
    >
      {isLogged ? (
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: category?.color || '#6B7280' }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {category?.name || 'Unknown'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {subcategory?.name || block.entry?.customSubcategory || ''}
            </p>
          </div>
          {block.entry?.note && (
            <NoteIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
        </div>
      ) : block.isPast ? (
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-3 h-3 rounded-full border-2 border-dashed border-gray-300" />
          <span className="text-sm">Not logged</span>
        </div>
      ) : block.isCurrent ? (
        <div className="flex items-center gap-2 text-blue-600">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-sm font-medium">Current block</span>
        </div>
      ) : null}
    </div>
  );
}

function NoteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
    </svg>
  );
}
