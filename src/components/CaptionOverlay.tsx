import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRoomContext } from '@livekit/react-native';
import type { TextStreamReader } from 'livekit-client';

import { theme } from '@/theme';

const TRANSCRIPTION_TOPIC = 'lk.transcription';
const HIDE_AFTER_MS = 3500;

/**
 * Live captions for the avatar's speech.
 *
 * The LiveKit agent forwards its transcribed replies to the room as text
 * streams on the `lk.transcription` topic — one stream per utterance, with
 * chunks arriving as the model speaks. We render the current utterance live
 * and fade it out a few seconds after it finishes.
 */
export function CaptionOverlay() {
  const room = useRoomContext();
  const [caption, setCaption] = useState('');
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

    const handler = async (
      reader: TextStreamReader,
      participantInfo: { identity: string },
    ) => {
      // Skip our own echoed transcription (if any) — captions are for the avatar.
      if (participantInfo.identity === room.localParticipant.identity) return;

      clearHideTimer();
      let text = '';
      for await (const chunk of reader) {
        if (cancelled) return;
        text += chunk;
        setCaption(text);
      }
      if (cancelled) return;
      hideTimer.current = setTimeout(() => {
        if (!cancelled) setCaption('');
      }, HIDE_AFTER_MS);
    };

    room.registerTextStreamHandler(TRANSCRIPTION_TOPIC, handler);

    return () => {
      cancelled = true;
      try {
        room.unregisterTextStreamHandler(TRANSCRIPTION_TOPIC);
      } catch {
        // Handler may already be gone if the room disconnected first.
      }
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
