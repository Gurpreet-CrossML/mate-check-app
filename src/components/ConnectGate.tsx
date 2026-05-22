import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/theme';

type Props = {
  status: 'idle' | 'connecting' | 'connected' | 'error';
  error: string | null;
  onConnect: () => void;
};

/** Pre-call landing screen: title, status, and a single "Start" button. */
export function ConnectGate({ status, error, onConnect }: Props) {
  const connecting = status === 'connecting';

  return (
    <LinearGradient colors={['#15122B', '#0B0B12']} style={styles.fill}>
      <SafeAreaView style={styles.center}>
        <View style={styles.orb}>
          <LinearGradient
            colors={[theme.colors.accent, '#3CCB7F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.orbInner}
          />
        </View>

        <Text style={styles.title}>Talking AI Avatar</Text>
        <Text style={styles.subtitle}>
          Powered by LiveKit, OpenAI &amp; Runway
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={onConnect}
          disabled={connecting}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            connecting && styles.buttonDisabled,
          ]}
        >
          {connecting ? (
            <ActivityIndicator color={theme.colors.text} />
          ) : (
            <Text style={styles.buttonText}>Start conversation</Text>
          )}
        </Pressable>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing(8),
    gap: theme.spacing(3),
  },
  orb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
    marginBottom: theme.spacing(4),
    shadowColor: theme.colors.accent,
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  orbInner: { flex: 1, borderRadius: 56 },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
  },
  error: {
    color: theme.colors.danger,
    fontSize: 14,
    textAlign: 'center',
    marginTop: theme.spacing(2),
  },
  button: {
    marginTop: theme.spacing(6),
    backgroundColor: theme.colors.accent,
    paddingVertical: theme.spacing(4),
    paddingHorizontal: theme.spacing(10),
    borderRadius: theme.radius.pill,
    minWidth: 220,
    alignItems: 'center',
  },
  buttonPressed: { backgroundColor: theme.colors.accentPressed },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
