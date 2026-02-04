import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { TimeEntry } from '../types';
import { useAuth } from './AuthContext';

interface TimeEntriesContextType {
  entries: TimeEntry[];
  loading: boolean;
  addEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt'>) => Promise<string>;
  updateEntry: (id: string, updates: Partial<TimeEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getEntriesForDateRange: (start: Date, end: Date) => TimeEntry[];
}

const TimeEntriesContext = createContext<TimeEntriesContextType | undefined>(undefined);

export function TimeEntriesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'timeEntries'),
      where('userId', '==', user.uid),
      orderBy('startTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newEntries: TimeEntry[] = [];
      snapshot.forEach((doc) => {
        newEntries.push({ id: doc.id, ...doc.data() } as TimeEntry);
      });
      setEntries(newEntries);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  async function addEntry(entry: Omit<TimeEntry, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'timeEntries'), {
      ...entry,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  }

  async function updateEntry(id: string, updates: Partial<TimeEntry>) {
    await updateDoc(doc(db, 'timeEntries', id), updates);
  }

  async function deleteEntry(id: string) {
    await deleteDoc(doc(db, 'timeEntries', id));
  }

  const getEntriesForDateRange = useCallback((start: Date, end: Date): TimeEntry[] => {
    return entries.filter((entry) => {
      const entryStart = entry.startTime.toDate();
      return entryStart >= start && entryStart < end;
    });
  }, [entries]);

  const value = {
    entries,
    loading,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntriesForDateRange,
  };

  return (
    <TimeEntriesContext.Provider value={value}>
      {children}
    </TimeEntriesContext.Provider>
  );
}

export function useTimeEntries() {
  const context = useContext(TimeEntriesContext);
  if (context === undefined) {
    throw new Error('useTimeEntries must be used within a TimeEntriesProvider');
  }
  return context;
}
