import { create } from "zustand";

export interface AudioTrack {
  id: string;
  title: string;
  slug?: string;
  authorName?: string;
  categoryName?: string;
  categorySlug?: string;
  postUrl?: string;
  thumbnailUrl?: string;
  audioUrl: string;
  duration?: number;
}

export interface AudioPlayerState {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  isMiniPlayerVisible: boolean;
  seekTarget: number | null;
  isRepeat: boolean;
  sleepTimer: number | null;
}

export interface AudioPlayerActions {
  playTrack: (track: AudioTrack) => void;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  clearSeekTarget: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaybackRate: (rate: number) => void;
  setIsRepeat: (isRepeat: boolean) => void;
  setSleepTimer: (timer: number | null) => void;
  showMiniPlayer: () => void;
  hideMiniPlayer: () => void;
  closeMiniPlayer: () => void;
  stopAndClose: () => void;
}

export type AudioPlayerStore = AudioPlayerState & AudioPlayerActions;

const initialAudioState: AudioPlayerState = {
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  isMiniPlayerVisible: false,
  seekTarget: null,
  isRepeat: false,
  sleepTimer: null,
};

export const useAudioPlayerStore = create<AudioPlayerStore>()((set, get) => ({
  ...initialAudioState,

  playTrack: (track: AudioTrack) => {
    const current = get().currentTrack;
    if (current?.id === track.id) {
      set({ isPlaying: true, isMiniPlayerVisible: true });
      return;
    }

    set({
      currentTrack: track,
      isPlaying: true,
      currentTime: 0,
      duration: track.duration || 0,
      isMiniPlayerVisible: true,
      seekTarget: null,
    });
  },

  togglePlay: () => {
    const { isPlaying, currentTrack } = get();
    if (!currentTrack) return;
    set({ isPlaying: !isPlaying, isMiniPlayerVisible: true });
  },

  play: () => {
    if (!get().currentTrack) return;
    set({ isPlaying: true, isMiniPlayerVisible: true });
  },

  pause: () => {
    set({ isPlaying: false });
  },

  seek: (time: number) => {
    set({ seekTarget: time, currentTime: time });
  },

  clearSeekTarget: () => {
    set({ seekTarget: null });
  },

  setCurrentTime: (currentTime: number) => {
    set({ currentTime });
  },

  setDuration: (duration: number) => {
    set({ duration });
  },

  setPlaybackRate: (playbackRate: number) => {
    set({ playbackRate });
  },

  setIsRepeat: (isRepeat: boolean) => {
    set({ isRepeat });
  },

  setSleepTimer: (sleepTimer: number | null) => {
    set({ sleepTimer });
  },

  showMiniPlayer: () => {
    set({ isMiniPlayerVisible: true });
  },

  hideMiniPlayer: () => {
    set({ isMiniPlayerVisible: false });
  },

  closeMiniPlayer: () => {
    // When user closes the mini player, pause playback and hide the widget
    set({
      isPlaying: false,
      isMiniPlayerVisible: false,
    });
  },

  stopAndClose: () => {
    set({
      isPlaying: false,
      isMiniPlayerVisible: false,
      currentTrack: null,
      currentTime: 0,
    });
  },
}));

// Atomic selector hooks for optimal performance
export const useCurrentTrack = () =>
  useAudioPlayerStore((state) => state.currentTrack);
export const useIsAudioPlaying = () =>
  useAudioPlayerStore((state) => state.isPlaying);
export const useAudioCurrentTime = () =>
  useAudioPlayerStore((state) => state.currentTime);
export const useAudioDuration = () =>
  useAudioPlayerStore((state) => state.duration);
export const useIsMiniPlayerVisible = () =>
  useAudioPlayerStore((state) => state.isMiniPlayerVisible);
