import type { Category } from '../types';

// Curated color palette for categories
export const COLOR_PALETTE = [
  { name: 'Slate', color: '#64748b' },
  { name: 'Stone', color: '#78716c' },
  { name: 'Red', color: '#ef4444' },
  { name: 'Orange', color: '#f97316' },
  { name: 'Amber', color: '#f59e0b' },
  { name: 'Yellow', color: '#eab308' },
  { name: 'Lime', color: '#84cc16' },
  { name: 'Green', color: '#22c55e' },
  { name: 'Emerald', color: '#10b981' },
  { name: 'Teal', color: '#14b8a6' },
  { name: 'Cyan', color: '#06b6d4' },
  { name: 'Sky', color: '#0ea5e9' },
  { name: 'Blue', color: '#3b82f6' },
  { name: 'Indigo', color: '#6366f1' },
  { name: 'Violet', color: '#8b5cf6' },
  { name: 'Purple', color: '#a855f7' },
  { name: 'Fuchsia', color: '#d946ef' },
  { name: 'Pink', color: '#ec4899' },
  { name: 'Rose', color: '#f43f5e' },
] as const;

// Use stable IDs so defaults can be identified across sessions
export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'default-work',
    name: 'Work',
    color: '#3b82f6', // Blue - professional, productive
    isDefault: true,
    subcategories: [
      { id: 'default-work-deep', name: 'Deep Work' },
      { id: 'default-work-meetings', name: 'Meetings' },
      { id: 'default-work-email', name: 'Email/Messages' },
      { id: 'default-work-admin', name: 'Admin' },
    ],
  },
  {
    id: 'default-school',
    name: 'School',
    color: '#8b5cf6', // Violet - academic, learning
    isDefault: true,
    subcategories: [
      { id: 'default-school-class', name: 'Class' },
      { id: 'default-school-study', name: 'Studying' },
      { id: 'default-school-homework', name: 'Homework' },
    ],
  },
  {
    id: 'default-sleep',
    name: 'Sleep',
    color: '#6366f1', // Indigo - calm, restful, night
    isDefault: true,
    subcategories: [],
  },
  {
    id: 'default-meal',
    name: 'Meal',
    color: '#f59e0b', // Amber - warm, food-related
    isDefault: true,
    subcategories: [],
  },
  {
    id: 'default-exercise',
    name: 'Exercise',
    color: '#ef4444', // Red - energy, physical activity
    isDefault: true,
    subcategories: [],
  },
  {
    id: 'default-social',
    name: 'Social',
    color: '#22c55e', // Green - connection, growth
    isDefault: true,
    subcategories: [],
  },
  {
    id: 'default-leisure',
    name: 'Leisure',
    color: '#ec4899', // Pink - relaxation, fun
    isDefault: true,
    subcategories: [],
  },
  {
    id: 'default-hobbies',
    name: 'Hobbies',
    color: '#14b8a6', // Teal - creativity, personal interest
    isDefault: true,
    subcategories: [
      { id: 'default-hobbies-gaming', name: 'Gaming' },
      { id: 'default-hobbies-reading', name: 'Reading' },
      { id: 'default-hobbies-music', name: 'Music' },
      { id: 'default-hobbies-art', name: 'Art/Crafts' },
    ],
  },
  {
    id: 'default-projects',
    name: 'Projects',
    color: '#06b6d4', // Cyan - innovation, building
    isDefault: true,
    subcategories: [
      { id: 'default-projects-side', name: 'Side Project' },
      { id: 'default-projects-learning', name: 'Learning' },
      { id: 'default-projects-creative', name: 'Creative' },
    ],
  },
  {
    id: 'default-personal',
    name: 'Personal',
    color: '#f97316', // Orange - self-care, daily life
    isDefault: true,
    subcategories: [
      { id: 'default-personal-chores', name: 'Chores' },
      { id: 'default-personal-errands', name: 'Errands' },
      { id: 'default-personal-commute', name: 'Commute' },
      { id: 'default-personal-selfcare', name: 'Self-care' },
    ],
  },
  {
    id: 'default-other',
    name: 'Other',
    color: '#64748b', // Slate - neutral, catch-all
    isDefault: true,
    subcategories: [],
  },
];

export const TIME_BLOCK_DURATIONS = [15, 30, 60, 120] as const;

export const TIME_PERIODS = [
  { value: '1d', label: '1 Day' },
  { value: '3d', label: '3 Days' },
  { value: '1w', label: '1 Week' },
  { value: '1m', label: '1 Month' },
] as const;
