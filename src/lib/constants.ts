import type { Category } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: uuidv4(),
    name: 'Work',
    color: '#3B82F6',
    isDefault: true,
    subcategories: [
      { id: uuidv4(), name: 'Email' },
      { id: uuidv4(), name: 'Meetings' },
      { id: uuidv4(), name: 'Deep Work' },
      { id: uuidv4(), name: 'Admin' },
      { id: uuidv4(), name: 'Other' },
    ],
  },
  {
    id: uuidv4(),
    name: 'Class',
    color: '#8B5CF6',
    isDefault: true,
    subcategories: [
      { id: uuidv4(), name: 'Lecture' },
      { id: uuidv4(), name: 'Study' },
      { id: uuidv4(), name: 'Homework' },
      { id: uuidv4(), name: 'Group Project' },
      { id: uuidv4(), name: 'Other' },
    ],
  },
  {
    id: uuidv4(),
    name: 'Social',
    color: '#22C55E',
    isDefault: true,
    subcategories: [
      { id: uuidv4(), name: 'Friends' },
      { id: uuidv4(), name: 'Family' },
      { id: uuidv4(), name: 'Events' },
      { id: uuidv4(), name: 'Other' },
    ],
  },
  {
    id: uuidv4(),
    name: 'Personal',
    color: '#F97316',
    isDefault: true,
    subcategories: [
      { id: uuidv4(), name: 'Errands' },
      { id: uuidv4(), name: 'Hobbies' },
      { id: uuidv4(), name: 'Entertainment' },
      { id: uuidv4(), name: 'Other' },
    ],
  },
  {
    id: uuidv4(),
    name: 'Health',
    color: '#EF4444',
    isDefault: true,
    subcategories: [
      { id: uuidv4(), name: 'Exercise' },
      { id: uuidv4(), name: 'Meal' },
      { id: uuidv4(), name: 'Sleep' },
      { id: uuidv4(), name: 'Other' },
    ],
  },
  {
    id: uuidv4(),
    name: 'Other',
    color: '#6B7280',
    isDefault: true,
    subcategories: [
      { id: uuidv4(), name: 'Miscellaneous' },
    ],
  },
];

export const TIME_BLOCK_DURATIONS = [15, 30, 60, 120] as const;

export const TIME_PERIODS = [
  { value: '1d', label: '1 Day' },
  { value: '3d', label: '3 Days' },
  { value: '1w', label: '1 Week' },
  { value: '1m', label: '1 Month' },
] as const;
