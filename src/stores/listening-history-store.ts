import { create } from "zustand";
import { StateStorage, createJSONStorage, persist } from "zustand/middleware";

import { getAppStorage, setAppStorage } from "@/lib/storage";

export interface ListeningHistoryItem {
  id: string;
  time: number; // Thời gian đã nghe (giây)
  createAt: string; // ISO date string thời điểm lần đầu nghe
  updateAt: string; // ISO date string thời điểm nghe/cập nhật gần nhất
  title: string;
  slug: string;
  authorName?: string;
  categoryName?: string;
  thumbnailUrl?: string;
  audioUrl?: string | null;
  duration?: number | null;
}

export interface ListeningHistoryState {
  history: ListeningHistoryItem[];
  isHydrated: boolean;
}

export interface ListeningHistoryActions {
  recordListening: (
    item: Omit<ListeningHistoryItem, "createAt" | "updateAt" | "time"> & {
      time?: number;
    }
  ) => void;
  updateProgress: (id: string, time: number) => void;
  removeHistoryItem: (id: string) => void;
  clearHistory: () => void;
  setHydrated: (val: boolean) => void;
}

export type ListeningHistoryStore = ListeningHistoryState &
  ListeningHistoryActions;

const listeningHistoryStorage: StateStorage = {
  getItem: (): string | null => {
    const data = getAppStorage();
    const history = Array.isArray(data["listening-history"])
      ? data["listening-history"]
      : [];
    return JSON.stringify({
      state: { history },
      version: 0,
    });
  },
  setItem: (_name: string, value: string): void => {
    try {
      const parsed = JSON.parse(value);
      setAppStorage({
        "listening-history": parsed?.state?.history || [],
      });
    } catch {
      // ignore
    }
  },
  removeItem: (): void => {
    setAppStorage({ "listening-history": [] });
  },
};

export const useListeningHistoryStore = create<ListeningHistoryStore>()(
  persist(
    (set, get) => ({
      history: [],
      isHydrated: false,

      setHydrated: (isHydrated: boolean) => set({ isHydrated }),

      recordListening: (item) => {
        const { history } = get();
        const now = new Date().toISOString();
        const existingIndex = history.findIndex((h) => h.id === item.id);

        if (existingIndex !== -1) {
          const existing = history[existingIndex];
          const updatedItem: ListeningHistoryItem = {
            ...existing,
            ...item,
            time: typeof item.time === "number" ? Math.floor(item.time) : existing.time,
            createAt: existing.createAt || now,
            updateAt: now,
          };

          const remaining = history.filter((_, idx) => idx !== existingIndex);
          set({
            history: [updatedItem, ...remaining].slice(0, 100),
          });
        } else {
          const newItem: ListeningHistoryItem = {
            id: item.id,
            title: item.title,
            slug: item.slug,
            authorName: item.authorName,
            categoryName: item.categoryName,
            thumbnailUrl: item.thumbnailUrl,
            audioUrl: item.audioUrl,
            duration: item.duration,
            time: typeof item.time === "number" ? Math.floor(item.time) : 0,
            createAt: now,
            updateAt: now,
          };

          set({
            history: [newItem, ...history].slice(0, 100),
          });
        }
      },

      updateProgress: (id: string, time: number) => {
        const { history } = get();
        if (!id) return;
        const now = new Date().toISOString();
        const existing = history.find((h) => h.id === id);

        if (existing) {
          set({
            history: history.map((item) =>
              item.id === id
                ? {
                    ...item,
                    time: Math.floor(time),
                    updateAt: now,
                  }
                : item
            ),
          });
        }
      },

      removeHistoryItem: (id: string) => {
        set({
          history: get().history.filter((h) => h.id !== id),
        });
      },

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "listening-history",
      storage: createJSONStorage(() => listeningHistoryStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

// Atomic selector hooks for optimal performance
export const useListeningHistoryList = () =>
  useListeningHistoryStore((state) => (state.isHydrated ? state.history : []));

export const useListeningHistoryCount = () =>
  useListeningHistoryStore((state) => (state.isHydrated ? state.history.length : 0));

export const useListeningHistoryItem = (id?: string) =>
  useListeningHistoryStore((state) =>
    state.isHydrated && id ? state.history.find((h) => h.id === id) : undefined
  );
