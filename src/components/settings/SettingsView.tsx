import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { TimeBlockDuration, Category, Subcategory } from '../../types';
import { TIME_BLOCK_DURATIONS } from '../../lib/constants';
import { getDurationLabel } from '../../lib/utils';
import { v4 as uuidv4 } from 'uuid';

export function SettingsView() {
  const { userProfile, updateUserProfile } = useAuth();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#6B7280');
  const [showAddCategory, setShowAddCategory] = useState(false);

  const categories = userProfile?.categories || [];
  const duration = userProfile?.timeBlockDuration || 30;

  async function handleDurationChange(newDuration: TimeBlockDuration) {
    await updateUserProfile({ timeBlockDuration: newDuration });
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return;

    const newCategory: Category = {
      id: uuidv4(),
      name: newCategoryName.trim(),
      color: newCategoryColor,
      subcategories: [{ id: uuidv4(), name: 'Other' }],
      isDefault: false,
    };

    await updateUserProfile({
      categories: [...categories, newCategory],
    });

    setNewCategoryName('');
    setNewCategoryColor('#6B7280');
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
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Settings</h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Time Block Duration</h3>
          <p className="text-sm text-gray-500">How long each time block should be</p>
        </div>
        <div className="p-4 flex flex-wrap gap-2">
          {TIME_BLOCK_DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => handleDurationChange(d)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                duration === d
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getDurationLabel(d)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Categories</h3>
            <p className="text-sm text-gray-500">Manage your activity categories</p>
          </div>
          <button
            onClick={() => setShowAddCategory(true)}
            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
          >
            + Add Category
          </button>
        </div>

        {showAddCategory && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex gap-3">
              <input
                type="color"
                value={newCategoryColor}
                onChange={(e) => setNewCategoryColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddCategory(false);
                  setNewCategoryName('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="divide-y divide-gray-100">
          {categories.map((category) => (
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

  return (
    <div className="p-4">
      <div className="flex items-center gap-3">
        {isEditing ? (
          <>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSave}
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              Save
            </button>
            <button
              onClick={onCancelEdit}
              className="text-gray-500 hover:text-gray-600 text-sm"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span className="flex-1 font-medium text-gray-900">{category.name}</span>
            <button
              onClick={onEdit}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              Edit
            </button>
            {!category.isDefault && (
              <button
                onClick={onDelete}
                className="text-red-400 hover:text-red-600 text-sm"
              >
                Delete
              </button>
            )}
          </>
        )}
      </div>

      <div className="mt-3 ml-7">
        <div className="flex flex-wrap gap-2">
          {category.subcategories.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-sm"
            >
              <span className="text-gray-700">{sub.name}</span>
              <button
                onClick={() => onDeleteSubcategory(sub.id)}
                className="text-gray-400 hover:text-red-500 ml-1"
              >
                ×
              </button>
            </div>
          ))}
          {showAddSub ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                placeholder="Name"
                className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                Add
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddSub(true)}
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              + Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
