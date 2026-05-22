import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTracks, VideoTrack } from '@livekit/react-native';
import { Track } from 'livekit-client';

import { theme } from '@/theme';

/**
 * Renders the avatar's video. The Runway avatar joins as a remote participant
 * and publishes a camera track, so we pick the first non-local camera track.
 * Until it arrives we show a tasteful "waking up" placeholder.
 */
export function AvatarStage() {
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });

  const avatarTrack = useMemo(
    () =>
      tracks.find(
        (t) => !t.participant.isLocal && t.publication?.track !== undefined,
      ),
    [tracks],
  );

  if (!avatarTrack) {
    return (
      <LinearGradient colors={['#1A1633', '#0B0B12']} style={styles.fill}>
        <View style={styles.placeholder}>
          <ActivityIndicator color={theme.colors.accent} size="large" />
          <Text style={styles.placeholderText}>Waking up the avatar…</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.fill}>
      {/* "contain" shows the whole avatar frame (letterboxed) instead of
          cropping it to fill the screen. */}
      <VideoTrack trackRef={avatarTrack} style={styles.fill} objectFit="contain" />
      {/* Subtle bottom scrim so the message bar stays readable over video. */}
      <LinearGradient
        colors={['transparent', 'rgba(11,11,18,0.85)']}
        style={styles.scrim}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: theme.colors.bg },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(3),
  },
  placeholderText: {
    color: theme.colors.textMuted,
    fontSize: 15,
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '32%',
  },
});
