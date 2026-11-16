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
  playlist: AudioTrack[];
  currentIndex: number;
  nextTrack: AudioTrack | null;
  isAutoPlayNext: boolean;
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
  playTrack: (track: AudioTrack, playlist?: AudioTrack[]) => void;
  setPlaylist: (playlist: AudioTrack[], startIndex?: number) => void;
  setNextTrack: (track: AudioTrack | null) => void;
  setIsAutoPlayNext: (isAutoPlayNext: boolean) => void;
  playNextTrack: () => AudioTrack | null;
  playPreviousTrack: () => AudioTrack | null;
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
  playlist: [],
  currentIndex: -1,
  nextTrack: null,
  isAutoPlayNext: true,
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

  playTrack: (track: AudioTrack, playlist?: AudioTrack[]) => {
    const state = get();
    const current = state.currentTrack;

    let newPlaylist = state.playlist;
    let newIndex = state.currentIndex;

    if (playlist && Array.isArray(playlist) && playlist.length > 0) {
      newPlaylist = playlist;
      newIndex = playlist.findIndex((t) => t.id === track.id);
    } else if (newPlaylist.length > 0) {
      newIndex = newPlaylist.findIndex((t) => t.id === track.id);
    }

    if (current?.id === track.id) {
      set({
        isPlaying: true,
        isMiniPlayerVisible: true,
        playlist: newPlaylist,
        currentIndex: newIndex,
      });
      return;
    }

    set({
      currentTrack: track,
      playlist: newPlaylist,
      currentIndex: newIndex,
      nextTrack: null,
      isPlaying: true,
      currentTime: 0,
      duration: track.duration || 0,
      isMiniPlayerVisible: true,
      seekTarget: null,
    });
  },

  setPlaylist: (playlist: AudioTrack[], startIndex: number = 0) => {
    set({
      playlist,
      currentIndex: startIndex >= 0 && startIndex < playlist.length ? startIndex : 0,
    });
  },

  setNextTrack: (nextTrack: AudioTrack | null) => {
    set({ nextTrack });
  },

  setIsAutoPlayNext: (isAutoPlayNext: boolean) => {
    set({ isAutoPlayNext });
  },

  playNextTrack: () => {
    const { playlist, currentIndex, nextTrack, currentTrack } = get();

    // 1. If we have a playlist with a subsequent track
    if (playlist.length > 0 && currentIndex >= 0 && currentIndex < playlist.length - 1) {
      const next = playlist[currentIndex + 1];
      set({
        currentTrack: next,
        currentIndex: currentIndex + 1,
        nextTrack: null,
        isPlaying: true,
        currentTime: 0,
        duration: next.duration || 0,
        isMiniPlayerVisible: true,
        seekTarget: null,
      });
      return next;
    }

    // 2. If a prefetched/explicit nextTrack is available
    if (nextTrack && nextTrack.id !== currentTrack?.id) {
      set({
        currentTrack: nextTrack,
        nextTrack: null,
        currentIndex: -1,
        isPlaying: true,
        currentTime: 0,
        duration: nextTrack.duration || 0,
        isMiniPlayerVisible: true,
        seekTarget: null,
      });
      return nextTrack;
    }

    return null;
  },

  playPreviousTrack: () => {
    const { playlist, currentIndex } = get();
    if (playlist.length > 0 && currentIndex > 0) {
      const prev = playlist[currentIndex - 1];
      set({
        currentTrack: prev,
        currentIndex: currentIndex - 1,
        nextTrack: null,
        isPlaying: true,
        currentTime: 0,
        duration: prev.duration || 0,
        isMiniPlayerVisible: true,
        seekTarget: null,
      });
      return prev;
    }
    return null;
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
      playlist: [],
      currentIndex: -1,
      nextTrack: null,
      currentTime: 0,
    });
  },
}));

// Atomic selector hooks for optimal performance
export const useCurrentTrack = () =>
  useAudioPlayerStore((state) => state.currentTrack);
export const useAudioPlaylist = () =>
  useAudioPlayerStore((state) => state.playlist);
export const useNextTrack = () =>
  useAudioPlayerStore((state) => state.nextTrack);
export const useIsAutoPlayNext = () =>
  useAudioPlayerStore((state) => state.isAutoPlayNext);
export const useIsAudioPlaying = () =>
  useAudioPlayerStore((state) => state.isPlaying);
export const useAudioCurrentTime = () =>
  useAudioPlayerStore((state) => state.currentTime);
export const useAudioDuration = () =>
  useAudioPlayerStore((state) => state.duration);
export const useIsMiniPlayerVisible = () =>
  useAudioPlayerStore((state) => state.isMiniPlayerVisible);
