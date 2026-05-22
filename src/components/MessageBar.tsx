import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalParticipant, useRoomContext } from '@livekit/react-native';

import { theme } from '@/theme';

/** Topic the agent listens on for typed messages (LiveKit chat convention). */
const CHAT_TOPIC = 'lk.chat';

/**
 * Bottom input bar: a growing text field with a Send button, and a mic toggle
 * on the right. Text is delivered to the agent over the `lk.chat` text stream;
 * the mic publishes/unpublishes the local audio track.
 */
export function MessageBar() {
  const room = useRoomContext();
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [micBusy, setMicBusy] = useState(false);

  const send = useCallback(async () => {
    const message = text.trim();
    if (!message || sending) return;
    setSending(true);
    try {
      await room.localParticipant.sendText(message, { topic: CHAT_TOPIC });
      setText('');
    } catch (e) {
      console.warn('Failed to send text:', e);
    } finally {
      setSending(false);
    }
  }, [text, sending, room]);

  const toggleMic = useCallback(async () => {
    if (micBusy) return;
    setMicBusy(true);
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    } catch (e) {
      console.warn('Failed to toggle mic:', e);
    } finally {
      setMicBusy(false);
    }
  }, [localParticipant, isMicrophoneEnabled, micBusy]);

  const canSend = text.trim().length > 0 && !sending;

  return (
    <View style={styles.bar}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Type a message…"
        placeholderTextColor={theme.colors.textMuted}
        multiline
        returnKeyType="send"
        blurOnSubmit
        onSubmitEditing={send}
      />

      {/* Send */}
      <Pressable
        onPress={send}
        disabled={!canSend}
        style={({ pressed }) => [
          styles.iconButton,
          styles.sendButton,
          pressed && canSend && styles.pressed,
          !canSend && styles.disabled,
        ]}
        accessibilityLabel="Send message"
      >
        {sending ? (
          <ActivityIndicator color={theme.colors.text} size="small" />
        ) : (
          <Text style={styles.iconGlyph}>↑</Text>
        )}
      </Pressable>

      {/* Mic toggle */}
      <Pressable
        onPress={toggleMic}
        disabled={micBusy}
        style={({ pressed }) => [
          styles.iconButton,
          isMicrophoneEnabled ? styles.micOn : styles.micOff,
          pressed && styles.pressed,
        ]}
        accessibilityLabel={isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'}
      >
        {micBusy ? (
          <ActivityIndicator color={theme.colors.text} size="small" />
        ) : (
          <Text style={styles.iconGlyph}>{isMicrophoneEnabled ? '🎙' : '🔇'}</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing(2),
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    padding: theme.spacing(2),
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
    maxHeight: 120,
    minHeight: 44,
    paddingHorizontal: theme.spacing(3),
    paddingTop: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: { backgroundColor: theme.colors.accent },
  micOn: { backgroundColor: theme.colors.danger },
  micOff: { backgroundColor: theme.colors.surfaceStrong },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.4 },
  iconGlyph: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
});
