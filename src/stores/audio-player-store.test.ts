import { describe, it, expect, beforeEach } from "vitest";
import { useAudioPlayerStore, AudioTrack } from "./audio-player-store";

describe("AudioPlayerStore - Auto Next & Playlist Queue", () => {
  const track1: AudioTrack = {
    id: "track-1",
    title: "Bạch Thoại Phật Pháp Tập 1",
    slug: "bach-thoai-phat-phap-tap-1",
    audioUrl: "https://example.com/tap1.mp3",
    duration: 1800,
  };

  const track2: AudioTrack = {
    id: "track-2",
    title: "Bạch Thoại Phật Pháp Tập 2",
    slug: "bach-thoai-phat-phap-tap-2",
    audioUrl: "https://example.com/tap2.mp3",
    duration: 1900,
  };

  const track3: AudioTrack = {
    id: "track-3",
    title: "Bạch Thoại Phật Pháp Tập 3",
    slug: "bach-thoai-phat-phap-tap-3",
    audioUrl: "https://example.com/tap3.mp3",
    duration: 2000,
  };

  beforeEach(() => {
    useAudioPlayerStore.getState().stopAndClose();
    useAudioPlayerStore.getState().setIsAutoPlayNext(true);
  });

  it("should initialize with default autoplay next enabled", () => {
    expect(useAudioPlayerStore.getState().isAutoPlayNext).toBe(true);
    expect(useAudioPlayerStore.getState().playlist).toEqual([]);
    expect(useAudioPlayerStore.getState().currentIndex).toBe(-1);
    expect(useAudioPlayerStore.getState().nextTrack).toBeNull();
  });

  it("should play track and store playlist with correct currentIndex", () => {
    const playlist = [track1, track2, track3];
    useAudioPlayerStore.getState().playTrack(track1, playlist);

    const state = useAudioPlayerStore.getState();
    expect(state.currentTrack?.id).toBe("track-1");
    expect(state.isPlaying).toBe(true);
    expect(state.playlist.length).toBe(3);
    expect(state.currentIndex).toBe(0);
  });

  it("should sequentially play next track within playlist via playNextTrack", () => {
    const playlist = [track1, track2, track3];
    useAudioPlayerStore.getState().playTrack(track1, playlist);

    // Play next -> Track 2
    const next1 = useAudioPlayerStore.getState().playNextTrack();
    expect(next1?.id).toBe("track-2");
    expect(useAudioPlayerStore.getState().currentTrack?.id).toBe("track-2");
    expect(useAudioPlayerStore.getState().currentIndex).toBe(1);

    // Play next -> Track 3
    const next2 = useAudioPlayerStore.getState().playNextTrack();
    expect(next2?.id).toBe("track-3");
    expect(useAudioPlayerStore.getState().currentTrack?.id).toBe("track-3");
    expect(useAudioPlayerStore.getState().currentIndex).toBe(2);

    // Play next at end of playlist -> returns null
    const next3 = useAudioPlayerStore.getState().playNextTrack();
    expect(next3).toBeNull();
  });

  it("should fall back to nextTrack when playlist is empty or ended", () => {
    useAudioPlayerStore.getState().playTrack(track1);
    expect(useAudioPlayerStore.getState().currentIndex).toBe(-1);

    // Set prefetched next track
    useAudioPlayerStore.getState().setNextTrack(track2);
    expect(useAudioPlayerStore.getState().nextTrack?.id).toBe("track-2");

    // Call playNextTrack -> switches to track2 and consumes nextTrack
    const next = useAudioPlayerStore.getState().playNextTrack();
    expect(next?.id).toBe("track-2");
    expect(useAudioPlayerStore.getState().currentTrack?.id).toBe("track-2");
    expect(useAudioPlayerStore.getState().nextTrack).toBeNull();
  });

  it("should support playPreviousTrack to go back in playlist", () => {
    const playlist = [track1, track2, track3];
    useAudioPlayerStore.getState().playTrack(track2, playlist);
    expect(useAudioPlayerStore.getState().currentIndex).toBe(1);

    const prev = useAudioPlayerStore.getState().playPreviousTrack();
    expect(prev?.id).toBe("track-1");
    expect(useAudioPlayerStore.getState().currentTrack?.id).toBe("track-1");
    expect(useAudioPlayerStore.getState().currentIndex).toBe(0);

    // At beginning of playlist -> returns null
    const beforeStart = useAudioPlayerStore.getState().playPreviousTrack();
    expect(beforeStart).toBeNull();
  });

  it("should toggle isAutoPlayNext state", () => {
    useAudioPlayerStore.getState().setIsAutoPlayNext(false);
    expect(useAudioPlayerStore.getState().isAutoPlayNext).toBe(false);

    useAudioPlayerStore.getState().setIsAutoPlayNext(true);
    expect(useAudioPlayerStore.getState().isAutoPlayNext).toBe(true);
  });
});
