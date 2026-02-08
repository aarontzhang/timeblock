import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useTimeEntries } from '../../contexts/TimeEntriesContext';
import type { TimeBlock, CategorySelection } from '../../types';
import { formatTimeRange } from '../../lib/utils';

interface LogPromptProps {
  block: TimeBlock;
  onClose: () => void;
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

export function LogPrompt({ block, onClose }: LogPromptProps) {
  const { userProfile, user } = useAuth();
  const { addEntry, updateEntry, deleteEntry } = useTimeEntries();

  const categories = (userProfile?.categories || []).slice().sort((a, b) => {
    const aIsOther = a.id === 'default-other' || a.name.toLowerCase() === 'other';
    const bIsOther = b.id === 'default-other' || b.name.toLowerCase() === 'other';
    if (aIsOther && !bIsOther) return 1;
    if (!aIsOther && bIsOther) return -1;
    return 0;
  });

  const isContinued = block.isContinued;
  const existingSelections = isContinued ? [] : getEntryCategories(block.entry);

  const [selections, setSelections] = useState<CategorySelection[]>(existingSelections);
  const [saving, setSaving] = useState(false);

  const isEditing = !!block.entry && !isContinued;

  function toggleCategory(categoryId: string) {
    setSelections(prev => {
      const existing = prev.find(s => s.categoryId === categoryId);
      if (existing) {
        return prev.filter(s => s.categoryId !== categoryId);
      } else {
        const newSelection: CategorySelection = categoryId === 'default-other'
          ? { categoryId, customSubcategory: '' }
          : { categoryId };
        return [...prev, newSelection];
      }
    });
  }

  function setOtherText(text: string) {
    setSelections(prev => prev.map(s => {
      if (s.categoryId === 'default-other') {
        return { ...s, customSubcategory: text };
      }
      return s;
    }));
  }

  function setSubcategory(categoryId: string, subcategoryId: string | undefined, customSubcategory?: string) {
    setSelections(prev => prev.map(s => {
      if (s.categoryId === categoryId) {
        return {
          ...s,
          subcategoryId: subcategoryId === 'other' ? undefined : subcategoryId,
          customSubcategory: subcategoryId === 'other' ? customSubcategory : undefined,
        };
      }
      return s;
    }));
  }

  function getSelection(categoryId: string): CategorySelection | undefined {
    return selections.find(s => s.categoryId === categoryId);
  }

  async function handleSave() {
    if (selections.length === 0 || !user) return;

    setSaving(true);

    try {
      const cleanedSelections = selections.map(selection => {
        const cleaned: Record<string, string> = { categoryId: selection.categoryId };
        if (selection.subcategoryId !== undefined) {
          cleaned.subcategoryId = selection.subcategoryId;
        }
        if (selection.customSubcategory !== undefined && selection.customSubcategory !== '') {
          cleaned.customSubcategory = selection.customSubcategory;
        }
        return cleaned;
      });

      const entryData: Record<string, any> = {
        userId: user.uid,
        categories: cleanedSelections,
        startTime: Timestamp.fromDate(block.startTime),
        endTime: Timestamp.fromDate(block.endTime),
      };

      if (isEditing && block.entry) {
        await updateEntry(block.entry.id, entryData);
      } else {
        await addEntry(entryData as any);
      }

      onClose();
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!block.entry) return;

    setSaving(true);
    try {
      await deleteEntry(block.entry.id);
      onClose();
    } catch (error) {
      console.error('Error deleting entry:', error);
    } finally {
      setSaving(false);
    }
  }

  const canSave = selections.length > 0;

  return (
    <div className="fixed inset-0 bg-black/15 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl w-full sm:max-w-md sm:rounded-3xl rounded-t-[2rem] max-h-[85vh] overflow-auto animate-slideUp">
        {/* Header */}
        <div className="px-7 pt-7 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-light text-neutral-500 tracking-wider">
                {isEditing ? 'edit' : 'log'}
              </h3>
              <p className="text-[10px] text-neutral-400 font-light mt-1 tracking-wide">
                {formatTimeRange(block.startTime, block.endTime)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 transition-colors duration-500 rounded-full"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
          {selections.length > 1 && (
            <p className="text-[10px] text-neutral-400 mt-3 font-light tracking-wide">
              split between {selections.length} activities
            </p>
          )}
        </div>

        {/* Content */}
        <div className="px-7 pb-5 space-y-5">
          <div>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => {
                const selection = getSelection(category.id);
                const isSelected = !!selection;
                const isOther = category.id === 'default-other';
                const displayName = isOther && selection?.customSubcategory
                  ? selection.customSubcategory
                  : category.name;
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`flex items-center gap-3 p-4 rounded-2xl transition-all duration-500 ${
                      isSelected
                        ? 'bg-neutral-50 ring-1 ring-neutral-200'
                        : 'hover:bg-neutral-50/50'
                    }`}
                  >
                    <div
                      className="w-[3px] h-5 rounded-full flex-shrink-0 opacity-85"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className={`text-xs font-light tracking-wide truncate ${
                      isSelected ? 'text-neutral-600' : 'text-neutral-500'
                    }`}>
                      {displayName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {getSelection('default-other') && (
            <div>
              <input
                type="text"
                value={getSelection('default-other')?.customSubcategory || ''}
                onChange={(e) => setOtherText(e.target.value)}
                placeholder="activity name"
                className="w-full px-5 py-3.5 border border-neutral-100 rounded-2xl focus:outline-none focus:ring-1 focus:ring-neutral-200 font-light text-xs text-neutral-600 placeholder:text-neutral-400 transition-all duration-500"
                autoFocus
              />
            </div>
          )}

          {selections.map(selection => {
            const category = categories.find(c => c.id === selection.categoryId);
            if (!category || category.subcategories.length === 0) return null;

            const currentSubId = selection.subcategoryId;
            const isOther = !currentSubId && selection.customSubcategory !== undefined;

            return (
              <div key={selection.categoryId}>
                <label className="flex items-center gap-2 text-[10px] font-light text-neutral-400 mb-3 tracking-wider">
                  <span
                    className="inline-block w-[3px] h-3 rounded-full opacity-85"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </label>
                <div className="flex flex-wrap gap-2">
                  {category.subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSubcategory(category.id, sub.id)}
                      className={`px-4 py-2.5 rounded-full text-[11px] font-light tracking-wide transition-all duration-500 ${
                        currentSubId === sub.id
                          ? 'bg-neutral-700 text-white'
                          : 'bg-neutral-50 text-neutral-500'
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                  <button
                    onClick={() => setSubcategory(category.id, 'other', '')}
                    className={`px-4 py-2.5 rounded-full text-[11px] font-light tracking-wide transition-all duration-500 ${
                      isOther
                        ? 'bg-neutral-700 text-white'
                        : 'bg-neutral-50 text-neutral-500'
                    }`}
                  >
                    Other
                  </button>
                </div>

                {isOther && (
                  <input
                    type="text"
                    value={selection.customSubcategory || ''}
                    onChange={(e) => setSubcategory(category.id, 'other', e.target.value)}
                    placeholder="custom activity"
                    className="mt-3 w-full px-5 py-3.5 border border-neutral-100 rounded-2xl focus:outline-none focus:ring-1 focus:ring-neutral-200 font-light text-xs text-neutral-600 placeholder:text-neutral-400 transition-all duration-500"
                    autoFocus
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-7 py-6 flex gap-3">
          {isEditing && !isContinued && (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="px-4 py-3 text-neutral-400 text-[11px] font-light tracking-wider transition-colors duration-500 disabled:opacity-50"
            >
              delete
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            disabled={saving}
            className="px-5 py-3 text-neutral-400 text-[11px] font-light tracking-wider transition-colors duration-500 disabled:opacity-50"
          >
            cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="px-6 py-3 bg-neutral-700 text-white rounded-2xl text-[11px] font-light tracking-wider transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {saving ? 'saving' : 'save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
