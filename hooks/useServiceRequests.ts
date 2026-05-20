import { useCallback, useState } from 'react';
import { useDatabase } from './useDatabase';
import { ServiceRequestsRepository } from '@/database/repositories/serviceRequests';
import { useUserActivityStore } from '@/store/userActivity.store';
import type { ServiceRequestType, ServiceRequestStatus } from '@/types/community';

export function useServiceRequests() {
  const db = useDatabase();
  const store = useUserActivityStore();
  const [submitting, setSubmitting] = useState(false);

  const submit = useCallback(
    async (data: {
      tipo: ServiceRequestType;
      descripcion?: string;
    }): Promise<void> => {
      setSubmitting(true);
      try {
        const repo = new ServiceRequestsRepository(db);
        const item = await repo.create(data);
        store.addServiceRequest(item);
      } finally {
        setSubmitting(false);
      }
    },
    [db, store]
  );

  const updateStatus = useCallback(
    async (id: string, estado: ServiceRequestStatus): Promise<void> => {
      const repo = new ServiceRequestsRepository(db);
      await repo.updateStatus(id, estado);
      store.updateServiceRequestStatus(id, estado);
    },
    [db, store]
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      const repo = new ServiceRequestsRepository(db);
      await repo.delete(id);
      store.deleteServiceRequest(id);
    },
    [db, store]
  );

  return {
    serviceRequests: store.serviceRequests,
    submitting,
    submit,
    updateStatus,
    remove,
  };
}
