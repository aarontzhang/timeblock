import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useTimeEntries } from '../../contexts/TimeEntriesContext';
import type { TimeBlock } from '../../types';
import { formatTimeRange } from '../../lib/utils';

interface LogPromptProps {
  block: TimeBlock;
  onClose: () => void;
}

export function LogPrompt({ block, onClose }: LogPromptProps) {
  const { userProfile, user } = useAuth();
  const { addEntry, updateEntry, deleteEntry } = useTimeEntries();

  const categories = userProfile?.categories || [];

  const [categoryId, setCategoryId] = useState(block.entry?.categoryId || '');
  const [subcategoryId, setSubcategoryId] = useState(block.entry?.subcategoryId || '');
  const [customSubcategory, setCustomSubcategory] = useState(block.entry?.customSubcategory || '');
  const [note, setNote] = useState(block.entry?.note || '');
  const [saving, setSaving] = useState(false);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const isOtherSubcategory = subcategoryId === 'other';
  const isEditing = !!block.entry;

  useEffect(() => {
    if (categoryId && selectedCategory) {
      const hasExistingSubcategory = selectedCategory.subcategories.some(
        (s) => s.id === subcategoryId
      );
      if (!hasExistingSubcategory && subcategoryId !== 'other') {
        setSubcategoryId('');
        setCustomSubcategory('');
      }
    }
  }, [categoryId, selectedCategory, subcategoryId]);

  async function handleSave() {
    if (!categoryId || !user) return;
    if (!subcategoryId && !customSubcategory) return;

    setSaving(true);

    try {
      const entryData = {
        userId: user.uid,
        categoryId,
        subcategoryId: isOtherSubcategory ? '' : subcategoryId,
        customSubcategory: isOtherSubcategory ? customSubcategory : undefined,
        startTime: Timestamp.fromDate(block.startTime),
        endTime: Timestamp.fromDate(block.endTime),
        note: note || undefined,
      };

      if (isEditing && block.entry) {
        await updateEntry(block.entry.id, entryData);
      } else {
        await addEntry(entryData);
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

  const canSave = categoryId && (subcategoryId || (isOtherSubcategory && customSubcategory));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full sm:max-w-md sm:rounded-lg rounded-t-xl max-h-[90vh] overflow-auto">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Edit Entry' : 'Log Time'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {formatTimeRange(block.startTime, block.endTime)}
          </p>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setCategoryId(category.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                    categoryId === category.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {selectedCategory && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedCategory.subcategories.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSubcategoryId(sub.id);
                      setCustomSubcategory('');
                    }}
                    className={`px-3 py-2 rounded-full text-sm transition-colors ${
                      subcategoryId === sub.id
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
                <button
                  onClick={() => setSubcategoryId('other')}
                  className={`px-3 py-2 rounded-full text-sm transition-colors ${
                    subcategoryId === 'other'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Other...
                </button>
              </div>

              {isOtherSubcategory && (
                <input
                  type="text"
                  value={customSubcategory}
                  onChange={(e) => setCustomSubcategory(e.target.value)}
                  placeholder="Enter custom activity"
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex gap-3">
          {isEditing && (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
            >
              Delete
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
