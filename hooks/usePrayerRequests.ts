import { useCallback, useState } from 'react';
import { useDatabase } from './useDatabase';
import { PrayerRequestsRepository } from '@/database/repositories/prayerRequests';
import { useUserActivityStore } from '@/store/userActivity.store';
import type { PrayerCategory, PrayerRequestStatus } from '@/types/community';

export function usePrayerRequests() {
  const db = useDatabase();
  const store = useUserActivityStore();
  const [submitting, setSubmitting] = useState(false);

  const submit = useCallback(
    async (data: {
      titulo: string;
      descripcion?: string;
      categoria: PrayerCategory;
      privado: boolean;
    }): Promise<void> => {
      setSubmitting(true);
      try {
        const repo = new PrayerRequestsRepository(db);
        const item = await repo.create({
          ...data,
          fecha: new Date().toISOString().split('T')[0],
        });
        store.addPrayerRequest(item);
      } finally {
        setSubmitting(false);
      }
    },
    [db, store]
  );

  const updateStatus = useCallback(
    async (id: string, estado: PrayerRequestStatus): Promise<void> => {
      const repo = new PrayerRequestsRepository(db);
      await repo.updateStatus(id, estado);
      store.updatePrayerRequestStatus(id, estado);
    },
    [db, store]
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      const repo = new PrayerRequestsRepository(db);
      await repo.delete(id);
      store.deletePrayerRequest(id);
    },
    [db, store]
  );

  return {
    prayerRequests: store.prayerRequests,
    submitting,
    submit,
    updateStatus,
    remove,
  };
}
