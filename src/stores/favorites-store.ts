import { create } from "zustand";
import { StateStorage, createJSONStorage, persist } from "zustand/middleware";

import { getAppStorage, setAppStorage } from "@/lib/storage";
import { trackBookmarkClick } from "@/lib/gtm";

export interface FavoriteItem {
  id: string;
  title: string;
  slug: string;
  authorName?: string;
  categoryName?: string;
  thumbnailUrl?: string;
  audioUrl?: string | null;
  duration?: number | null;
  type?: string;
  savedAt: string;
}

export interface FavoritesState {
  favorites: FavoriteItem[];
  isHydrated: boolean;
}

export interface FavoritesActions {
  addFavorite: (item: Omit<FavoriteItem, "savedAt">) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (item: Omit<FavoriteItem, "savedAt">) => boolean;
  clearFavorites: () => void;
  setHydrated: (val: boolean) => void;
}

export type FavoritesStore = FavoritesState & FavoritesActions;

const favoritesStorage: StateStorage = {
  getItem: (): string | null => {
    const data = getAppStorage();
    return JSON.stringify({
      state: {
        favorites: Array.isArray(data.favorites) ? data.favorites : [],
      },
      version: 0,
    });
  },
  setItem: (_name: string, value: string): void => {
    try {
      const parsed = JSON.parse(value);
      setAppStorage({
        favorites: parsed?.state?.favorites || [],
      });
    } catch {
      // ignore
    }
  },
  removeItem: (): void => {
    setAppStorage({ favorites: [] });
  },
};

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      isHydrated: false,

      setHydrated: (isHydrated: boolean) => set({ isHydrated }),

      addFavorite: (item) => {
        const { favorites } = get();
        if (favorites.some((f) => f.id === item.id)) return;
        set({
          favorites: [
            {
              ...item,
              savedAt: new Date().toISOString(),
            },
            ...favorites,
          ],
        });
      },

      removeFavorite: (id: string) => {
        set({
          favorites: get().favorites.filter((f) => f.id !== id),
        });
      },

      toggleFavorite: (item) => {
        const { favorites } = get();
        const exists = favorites.some((f) => f.id === item.id);
        if (exists) {
          trackBookmarkClick({
            action: "remove",
            itemTitle: item.title,
            itemId: item.id,
            category: item.categoryName,
          });
          set({
            favorites: favorites.filter((f) => f.id !== item.id),
          });
          return false;
        } else {
          trackBookmarkClick({
            action: "add",
            itemTitle: item.title,
            itemId: item.id,
            category: item.categoryName,
          });
          set({
            favorites: [
              {
                ...item,
                savedAt: new Date().toISOString(),
              },
              ...favorites,
            ],
          });
          return true;
        }
      },

      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: "favorites",
      storage: createJSONStorage(() => favoritesStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

// Atomic selector hooks
export const useFavoritesList = () =>
  useFavoritesStore((state) => (state.isHydrated ? state.favorites : []));

export const useFavoritesCount = () =>
  useFavoritesStore((state) => (state.isHydrated ? state.favorites.length : 0));

export const useIsFavorite = (id?: string) =>
  useFavoritesStore((state) =>
    state.isHydrated && id ? state.favorites.some((f) => f.id === id) : false
  );
