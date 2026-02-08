import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { TimeBlockDuration, Category, Subcategory } from '../../types';
import { TIME_BLOCK_DURATIONS, COLOR_PALETTE } from '../../lib/constants';
import { getDurationLabel } from '../../lib/utils';
import { v4 as uuidv4 } from 'uuid';

export function SettingsView() {
  const { user, userProfile, updateUserProfile, logout } = useAuth();
  const [showCategoryEditor, setShowCategoryEditor] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState<string>(COLOR_PALETTE[0].color);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const categories = userProfile?.categories || [];
  const duration = userProfile?.timeBlockDuration || 30;

  const displayName = userProfile?.displayName || user?.displayName || 'User';
  const email = userProfile?.email || user?.email || '';

  async function handleDurationChange(newDuration: TimeBlockDuration) {
    await updateUserProfile({ timeBlockDuration: newDuration });
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return;

    const newCategory: Category = {
      id: uuidv4(),
      name: newCategoryName.trim(),
      color: newCategoryColor,
      subcategories: [],
      isDefault: false,
    };

    await updateUserProfile({
      categories: [...categories, newCategory],
    });

    setNewCategoryName('');
    setNewCategoryColor(COLOR_PALETTE[0].color);
    setShowAddCategory(false);
  }

  async function handleDeleteCategory(categoryId: string) {
    const category = categories.find((c) => c.id === categoryId);
    if (category?.isDefault) {
      alert('Cannot delete default categories');
      return;
    }

    await updateUserProfile({
      categories: categories.filter((c) => c.id !== categoryId),
    });
  }

  async function handleUpdateCategory(categoryId: string, updates: Partial<Category>) {
    await updateUserProfile({
      categories: categories.map((c) =>
        c.id === categoryId ? { ...c, ...updates } : c
      ),
    });
    setEditingCategory(null);
  }

  async function handleAddSubcategory(categoryId: string, name: string) {
    if (!name.trim()) return;

    const newSubcategory: Subcategory = {
      id: uuidv4(),
      name: name.trim(),
    };

    await updateUserProfile({
      categories: categories.map((c) =>
        c.id === categoryId
          ? { ...c, subcategories: [...c.subcategories, newSubcategory] }
          : c
      ),
    });
  }

  async function handleDeleteSubcategory(categoryId: string, subcategoryId: string) {
    await updateUserProfile({
      categories: categories.map((c) =>
        c.id === categoryId
          ? { ...c, subcategories: c.subcategories.filter((s) => s.id !== subcategoryId) }
          : c
      ),
    });
  }

  return (
    <div className="max-w-lg mx-auto px-5 pt-6 pb-28">
      <h2 className="text-sm font-light text-neutral-700 tracking-wider mb-8">settings</h2>

      {/* Profile */}
      <div className="mb-8 px-1">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
            <span className="text-xs font-light text-neutral-500">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-light text-neutral-800 tracking-wide truncate">
              {displayName}
            </p>
            <p className="text-[11px] text-neutral-500 font-light truncate">
              {email}
            </p>
          </div>
        </div>
      </div>

      {/* Time Block Duration */}
      <div className="mb-8">
        <div className="px-1 mb-4">
          <h3 className="text-[11px] font-light text-neutral-600 tracking-wider">block duration</h3>
        </div>
        <div className="flex gap-2">
          {TIME_BLOCK_DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => handleDurationChange(d)}
              className={`flex-1 py-3 rounded-2xl text-[11px] font-light tracking-wider transition-all duration-500 ${
                duration === d
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-500'
              }`}
            >
              {getDurationLabel(d)}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <button
          onClick={() => setShowCategoryEditor(!showCategoryEditor)}
          className="w-full px-1 flex items-center justify-between text-left mb-4"
        >
          <div>
            <h3 className="text-[11px] font-light text-neutral-600 tracking-wider">categories</h3>
            <p className="text-[11px] text-neutral-500 font-light mt-0.5">{categories.length} total</p>
          </div>
          <ChevronIcon className={`w-4 h-4 text-neutral-500 transition-transform duration-500 ${showCategoryEditor ? 'rotate-180' : ''}`} />
        </button>

        {showCategoryEditor && (
          <div className="space-y-1">
            <div className="px-1 pb-2">
              <button
                onClick={() => setShowAddCategory(true)}
                className="text-neutral-500 text-[11px] font-light tracking-wider transition-colors duration-500"
              >
                + add category
              </button>
            </div>

            {showAddCategory && (
              <div className="px-5 py-5 rounded-2xl bg-neutral-50/50">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="category name"
                  className="w-full px-0 py-2.5 border-b border-neutral-200 focus:outline-none focus:border-neutral-400 font-light text-sm text-neutral-800 placeholder:text-neutral-400 bg-transparent transition-colors duration-500 mb-4"
                  autoFocus
                />
                <p className="text-[11px] text-neutral-500 font-light mb-3 tracking-wider">color</p>
                <ColorPalette
                  selectedColor={newCategoryColor}
                  onSelect={setNewCategoryColor}
                />
                <div className="flex justify-end gap-3 mt-5">
                  <button
                    onClick={() => {
                      setShowAddCategory(false);
                      setNewCategoryName('');
                      setNewCategoryColor(COLOR_PALETTE[0].color);
                    }}
                    className="px-4 py-2.5 text-neutral-500 text-xs font-light tracking-wider transition-colors duration-500"
                  >
                    cancel
                  </button>
                  <button
                    onClick={handleAddCategory}
                    disabled={!newCategoryName.trim()}
                    className="px-5 py-2.5 bg-neutral-800 text-white rounded-2xl text-xs font-light tracking-wider disabled:opacity-30 transition-all duration-500"
                  >
                    add
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-px">
              {[...categories].sort((a, b) => {
                const aIsOther = a.id === 'default-other' || a.name.toLowerCase() === 'other';
                const bIsOther = b.id === 'default-other' || b.name.toLowerCase() === 'other';
                if (aIsOther && !bIsOther) return 1;
                if (!aIsOther && bIsOther) return -1;
                return 0;
              }).map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  isEditing={editingCategory?.id === category.id}
                  onEdit={() => setEditingCategory(category)}
                  onCancelEdit={() => setEditingCategory(null)}
                  onUpdate={(updates) => handleUpdateCategory(category.id, updates)}
                  onDelete={() => handleDeleteCategory(category.id)}
                  onAddSubcategory={(name) => handleAddSubcategory(category.id, name)}
                  onDeleteSubcategory={(subId) => handleDeleteSubcategory(category.id, subId)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sign Out */}
      <button
        onClick={logout}
        className="w-full py-4 text-neutral-500 font-light text-xs tracking-wider transition-colors duration-500"
      >
        sign out
      </button>
    </div>
  );
}

interface ColorPaletteProps {
  selectedColor: string;
  onSelect: (color: string) => void;
}

function ColorPalette({ selectedColor, onSelect }: ColorPaletteProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {COLOR_PALETTE.map(({ color }) => (
        <button
          key={color}
          onClick={() => onSelect(color)}
          className={`w-6 h-6 rounded-full transition-all duration-500 ${
            selectedColor.toLowerCase() === color.toLowerCase()
              ? 'ring-1 ring-offset-2 ring-neutral-400 scale-110'
              : 'opacity-50'
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

interface CategoryItemProps {
  category: Category;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (updates: Partial<Category>) => void;
  onDelete: () => void;
  onAddSubcategory: (name: string) => void;
  onDeleteSubcategory: (id: string) => void;
}

function CategoryItem({
  category,
  isEditing,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onAddSubcategory,
  onDeleteSubcategory,
}: CategoryItemProps) {
  const [name, setName] = useState(category.name);
  const [color, setColor] = useState(category.color);
  const [newSubName, setNewSubName] = useState('');
  const [showAddSub, setShowAddSub] = useState(false);

  function handleSave() {
    onUpdate({ name, color });
  }

  function handleAddSub() {
    if (newSubName.trim()) {
      onAddSubcategory(newSubName);
      setNewSubName('');
      setShowAddSub(false);
    }
  }

  if (isEditing) {
    return (
      <div className="px-5 py-5 rounded-2xl bg-neutral-50/50">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-0 py-2.5 border-b border-neutral-200 focus:outline-none focus:border-neutral-400 font-light text-sm text-neutral-800 bg-transparent transition-colors duration-500 mb-4"
        />
        <p className="text-[11px] text-neutral-500 font-light mb-3 tracking-wider">color</p>
        <ColorPalette selectedColor={color} onSelect={setColor} />
        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onCancelEdit}
            className="px-4 py-2.5 text-neutral-500 text-xs font-light tracking-wider transition-colors duration-500"
          >
            cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-neutral-800 text-white rounded-2xl text-xs font-light tracking-wider transition-all duration-500"
          >
            save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-4 rounded-2xl">
      <div className="flex items-center gap-3">
        <div
          className="w-[3px] h-5 rounded-full flex-shrink-0 opacity-85"
          style={{ backgroundColor: category.color }}
        />
        <span className="flex-1 text-xs font-light text-neutral-700 tracking-wide">{category.name}</span>
        <button
          onClick={onEdit}
          className="text-neutral-500 text-[11px] font-light tracking-wider transition-colors duration-500"
        >
          edit
        </button>
        {!category.isDefault && (
          <button
            onClick={onDelete}
            className="text-neutral-500 text-[11px] font-light tracking-wider transition-colors duration-500"
          >
            remove
          </button>
        )}
      </div>

      <div className="mt-3 ml-4">
        <div className="flex flex-wrap gap-2">
          {category.subcategories.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px]"
            >
              <span className="text-neutral-500 font-light">{sub.name}</span>
              <button
                onClick={() => onDeleteSubcategory(sub.id)}
                className="text-neutral-500 transition-colors duration-500"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </div>
          ))}
          {showAddSub ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                placeholder="name"
                className="w-24 px-0 py-1.5 text-[11px] border-b border-neutral-200 focus:outline-none focus:border-neutral-400 font-light text-neutral-700 bg-transparent transition-colors duration-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSub();
                  if (e.key === 'Escape') {
                    setShowAddSub(false);
                    setNewSubName('');
                  }
                }}
              />
              <button
                onClick={handleAddSub}
                className="text-neutral-500 text-[11px] font-light tracking-wider transition-colors duration-500"
              >
                add
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddSub(true)}
              className="text-neutral-500 text-[11px] font-light tracking-wider transition-colors duration-500"
            >
              + add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
