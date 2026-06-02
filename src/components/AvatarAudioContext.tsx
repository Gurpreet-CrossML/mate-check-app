import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRemoteParticipants } from '@livekit/react-native';

type AvatarAudioContextValue = {
  /** Whether the avatar's audio playback is currently muted. */
  muted: boolean;
  /** Flip the muted state. */
  toggleMuted: () => void;
};

const AvatarAudioContext = createContext<AvatarAudioContextValue | null>(null);

/**
 * Controls the playback volume of the avatar's audio WITHOUT touching its video.
 *
 * Muting is done via `RemoteParticipant.setVolume(0)` rather than unsubscribing
 * the audio track, so the track keeps flowing. That means:
 *   - the avatar's lip-sync / video is completely unaffected, and
 *   - LiveKit still emits `ActiveSpeakersChanged` (which the caption overlay
 *     relies on to reveal captions while the avatar is "speaking").
 *
 * `setVolume` is cached per-participant by livekit-client and re-applied to
 * tracks as they (re)subscribe, so the choice survives reconnects and any
 * avatar participant that joins later.
 *
 * The avatar starts UNMUTED — the user opts into muting from the controls.
 */
export function AvatarAudioProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(false);
  const remoteParticipants = useRemoteParticipants();

  useEffect(() => {
    const volume = muted ? 0 : 1;
    for (const participant of remoteParticipants) {
      participant.setVolume(volume);
    }
  }, [muted, remoteParticipants]);

  const toggleMuted = useCallback(() => setMuted((m) => !m), []);

  const value = useMemo(() => ({ muted, toggleMuted }), [muted, toggleMuted]);

  return (
    <AvatarAudioContext.Provider value={value}>
      {children}
    </AvatarAudioContext.Provider>
  );
}

export function useAvatarAudio() {
  const ctx = useContext(AvatarAudioContext);
  if (!ctx) {
    throw new Error('useAvatarAudio must be used within an AvatarAudioProvider');
  }
  return ctx;
}
