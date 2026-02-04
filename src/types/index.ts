import { Timestamp } from 'firebase/firestore';

export interface Subcategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  subcategories: Subcategory[];
  isDefault: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  timeBlockDuration: 15 | 30 | 60 | 120;
  categories: Category[];
  createdAt: Timestamp;
  notificationsEnabled: boolean;
}

export interface TimeEntry {
  id: string;
  userId: string;
  categoryId: string;
  subcategoryId: string;
  customSubcategory?: string;
  startTime: Timestamp;
  endTime: Timestamp;
  note?: string;
  createdAt: Timestamp;
}

export type TimeBlockDuration = 15 | 30 | 60 | 120;

export interface TimeBlock {
  startTime: Date;
  endTime: Date;
  entry?: TimeEntry;
  isCurrent: boolean;
  isPast: boolean;
}

export type TimePeriod = '1d' | '3d' | '1w' | '1m' | 'custom';
