import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRoomContext } from '@livekit/react-native';
import { RoomEvent, type Participant, type TextStreamReader } from 'livekit-client';

import { theme } from '@/theme';

const TRANSCRIPTION_TOPIC = 'lk.transcription';

// Keep the caption on screen this long AFTER the avatar finishes speaking so a
// viewer reading along can catch the end of the sentence.
const HIDE_AFTER_AVATAR_STOPS_MS = 2000;

/**
 * Live captions for the avatar's speech.
 *
 * The LLM streams transcribed text on the `lk.transcription` topic — usually
 * FASTER than the avatar can actually say it (the model emits tokens quickly,
 * but the audio takes real time to play). So we don't display the text as it
 * arrives: we buffer it, and only reveal a caption while the avatar is
 * ACTUALLY speaking (we detect that via LiveKit's `ActiveSpeakersChanged`
 * event, which fires from real audio activity on the avatar's track). After
 * the avatar stops, we keep the caption visible `HIDE_AFTER_AVATAR_STOPS_MS`
 * longer, then clear.
 */
export function CaptionOverlay() {
  const room = useRoomContext();
  const [caption, setCaption] = useState('');

  // Text chunks accumulate here as they stream in. We only mirror this into
  // the visible caption state while the avatar is actively speaking.
  const pendingText = useRef('');
  const avatarSpeaking = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!room) return;
    let cancelled = false;

    const clearHideTimer = () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
    };

    const handleTextStream = async (
      reader: TextStreamReader,
      participantInfo: { identity: string },
    ) => {
      // Skip the user's own STT transcription — captions are for the avatar.
      if (participantInfo.identity === room.localParticipant.identity) return;

      pendingText.current = '';
      for await (const chunk of reader) {
        if (cancelled) return;
        pendingText.current += chunk;
        // If the avatar is already mid-utterance, keep the visible caption in
        // sync as more text arrives. If it hasn't started yet, just buffer.
        if (avatarSpeaking.current) {
          setCaption(pendingText.current);
        }
      }
    };

    // The LiveKit agent has audioEnabled=false on its session, so it never
    // shows up as an active speaker — the only remote speaker in this room is
    // the Runway avatar. So "any remote participant currently speaking" = avatar.
    const isAvatar = (p: Participant) =>
      p.identity !== room.localParticipant.identity;

    const handleSpeakersChanged = (speakers: Participant[]) => {
      const speakingNow = speakers.some(isAvatar);
      if (speakingNow && !avatarSpeaking.current) {
        // Started speaking → reveal whatever we've buffered (LLM has usually
        // already finished streaming by this point; if not, the text stream
        // handler will keep updating the caption live).
        clearHideTimer();
        avatarSpeaking.current = true;
        setCaption(pendingText.current);
      } else if (!speakingNow && avatarSpeaking.current) {
        // Stopped speaking → keep caption visible HIDE_AFTER_AVATAR_STOPS_MS
        // longer, then clear.
        avatarSpeaking.current = false;
        clearHideTimer();
        hideTimer.current = setTimeout(() => {
          if (!cancelled) {
            setCaption('');
            pendingText.current = '';
          }
        }, HIDE_AFTER_AVATAR_STOPS_MS);
      }
    };

    room.registerTextStreamHandler(TRANSCRIPTION_TOPIC, handleTextStream);
    room.on(RoomEvent.ActiveSpeakersChanged, handleSpeakersChanged);

    return () => {
      cancelled = true;
      try {
        room.unregisterTextStreamHandler(TRANSCRIPTION_TOPIC);
      } catch {
        // Handler may already be gone if the room disconnected first.
      }
      room.off(RoomEvent.ActiveSpeakersChanged, handleSpeakersChanged);
      clearHideTimer();
    };
  }, [room]);

  if (!caption) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Text style={styles.text}>{caption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(3),
    maxWidth: 600,
    alignSelf: 'center',
  },
  text: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 22,
    textAlign: 'center',
  },
});
