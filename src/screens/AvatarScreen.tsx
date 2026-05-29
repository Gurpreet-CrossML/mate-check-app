import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/theme';
import { AvatarStage } from '@/components/AvatarStage';
import { CaptionOverlay } from '@/components/CaptionOverlay';
import { MessageBar } from '@/components/MessageBar';
import { StatusPill } from '@/components/StatusPill';

type Props = {
  onLeave: () => void;
};

/**
 * The one and only screen.
 *  - Full-bleed avatar video.
 *  - Connection status pill (top).
 *  - Message bar with text input + send + mic (bottom).
 */
export function AvatarScreen({ onLeave }: Props) {
  return (
    <View style={styles.root}>
      {/* Avatar fills the whole screen, behind everything. */}
      <AvatarStage />

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topRow} pointerEvents="box-none">
          <StatusPill onLeave={onLeave} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.bottom}
          pointerEvents="box-none"
        >
          <CaptionOverlay />
          <MessageBar />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topRow: {
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(2),
    alignItems: 'center',
  },
  bottom: {
    paddingHorizontal: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    gap: theme.spacing(2),
  },
});
