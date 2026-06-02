import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useConnectionState } from '@livekit/react-native';
import { ConnectionState } from 'livekit-client';

import { theme } from '@/theme';

type Props = {
  onLeave: () => void;
};

const LABELS: Record<ConnectionState, string> = {
  [ConnectionState.Disconnected]: 'Disconnected',
  [ConnectionState.Connecting]: 'Connecting…',
  [ConnectionState.Connected]: 'Live',
  [ConnectionState.Reconnecting]: 'Reconnecting…',
  [ConnectionState.SignalReconnecting]: 'Reconnecting…',
};

/** Floating status chip + a leave button. */
export function StatusPill({ onLeave }: Props) {
  const connectionState = useConnectionState();
  const isLive = connectionState === ConnectionState.Connected;

  return (
    <View style={styles.row}>
      <View style={styles.pill}>
        <View style={[styles.dot, isLive ? styles.dotLive : styles.dotIdle]} />
        <Text style={styles.label}>{LABELS[connectionState] ?? 'Connecting…'}</Text>
      </View>

      <Pressable
        onPress={onLeave}
        style={({ pressed }) => [styles.leave, pressed && styles.pressed]}
        accessibilityLabel="Leave conversation"
      >
        <Feather name="x" size={18} color={theme.colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: theme.spacing(3),
    paddingVertical: theme.spacing(2),
    borderRadius: theme.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotLive: { backgroundColor: theme.colors.success },
  dotIdle: { backgroundColor: theme.colors.textMuted },
  label: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  leave: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  pressed: { opacity: 0.6 },
});
