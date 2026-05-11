import { create } from 'zustand';
import { type Favorite } from '@/types';

interface FavoritesState {
  favorites: Favorite[];
  setFavorites: (favs: Favorite[]) => void;
  addFavoriteToStore: (fav: Favorite) => void;
  removeFavoriteFromStore: (contentId: string) => void;
  isFavorite: (contentId: string) => boolean;
  getFavoritesByType: (type: Favorite['content_type']) => Favorite[];
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],

  setFavorites: (favs) => set({ favorites: favs }),

  addFavoriteToStore: (fav) =>
    set(state => ({ favorites: [fav, ...state.favorites] })),

  removeFavoriteFromStore: (contentId) =>
    set(state => ({
      favorites: state.favorites.filter(f => f.content_id !== contentId),
    })),

  isFavorite: (contentId) =>
    get().favorites.some(f => f.content_id === contentId),

  getFavoritesByType: (type) =>
    get().favorites.filter(f => f.content_type === type),
}));
