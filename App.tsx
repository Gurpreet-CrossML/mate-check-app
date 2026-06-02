import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AudioSession, LiveKitRoom } from '@livekit/react-native';

import { fetchConnectionDetails, type ConnectionDetails } from '@/lib/api';
import { theme } from '@/theme';
import { AvatarScreen } from '@/screens/AvatarScreen';
import { AvatarAudioProvider } from '@/components/AvatarAudioContext';
import { ConnectGate } from '@/components/ConnectGate';

type Status = 'idle' | 'connecting' | 'connected' | 'error';

export default function App() {
  const [details, setDetails] = useState<ConnectionDetails | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  // Manage the OS audio session for the lifetime of the app.
  useEffect(() => {
    AudioSession.startAudioSession();
    return () => {
      AudioSession.stopAudioSession();
    };
  }, []);

  const connect = useCallback(async () => {
    setStatus('connecting');
    setError(null);
    try {
      const d = await fetchConnectionDetails();
      setDetails(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to connect');
      setStatus('error');
    }
  }, []);

  const disconnect = useCallback(() => {
    setDetails(null);
    setStatus('idle');
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.root}>
        {details ? (
          <LiveKitRoom
            serverUrl={details.url}
            token={details.token}
            connect
            audio={false}
            video={false}
            onConnected={() => setStatus('connected')}
            onDisconnected={disconnect}
            onError={(e) => {
              setError(e?.message ?? 'Room error');
              setStatus('error');
            }}
          >
            <AvatarAudioProvider>
              <AvatarScreen onLeave={disconnect} />
            </AvatarAudioProvider>
          </LiveKitRoom>
        ) : (
          <ConnectGate status={status} error={error} onConnect={connect} />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
});
