import { useCallback } from 'react';
import { useDatabase } from './useDatabase';
import { FavoritesRepository } from '@/database/repositories/favorites';
import { useFavoritesStore } from '@/store/favorites.store';
import { type Favorite } from '@/types';

export function useFavorites() {
  const db = useDatabase();
  const store = useFavoritesStore();

  const toggleFavorite = useCallback(
    async (
      contentId: string,
      contentType: Favorite['content_type'],
      courseId?: string
    ) => {
      const repo = new FavoritesRepository(db);
      if (store.isFavorite(contentId)) {
        store.removeFavoriteFromStore(contentId);
        await repo.removeFavorite(contentId);
      } else {
        await repo.addFavorite(contentId, contentType, courseId);
        const updated = await repo.getAllFavorites();
        store.setFavorites(updated);
      }
    },
    [db, store]
  );

  return {
    favorites: store.favorites,
    isFavorite: store.isFavorite,
    toggleFavorite,
    getFavoritesByType: store.getFavoritesByType,
  };
}
