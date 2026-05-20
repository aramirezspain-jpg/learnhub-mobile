import { useCallback, useState } from 'react';
import { useDatabase } from './useDatabase';
import { LeadershipMessagesRepository } from '@/database/repositories/leadershipMessages';
import { useUserActivityStore } from '@/store/userActivity.store';
import type { MessagePriority } from '@/types/community';

export function useLeadershipMessages() {
  const db = useDatabase();
  const store = useUserActivityStore();
  const [submitting, setSubmitting] = useState(false);

  const submit = useCallback(
    async (data: {
      ministerio: string;
      mensaje: string;
      prioridad: MessagePriority;
    }): Promise<void> => {
      setSubmitting(true);
      try {
        const repo = new LeadershipMessagesRepository(db);
        const item = await repo.create(data);
        store.addLeadershipMessage(item);
      } finally {
        setSubmitting(false);
      }
    },
    [db, store]
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      const repo = new LeadershipMessagesRepository(db);
      await repo.delete(id);
      store.deleteLeadershipMessage(id);
    },
    [db, store]
  );

  return {
    messages: store.leadershipMessages,
    submitting,
    submit,
    remove,
  };
}
