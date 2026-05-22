import { registerRootComponent } from 'expo';
import { registerGlobals } from '@livekit/react-native';

// Must run before any LiveKit / WebRTC code. Sets up the WebRTC globals
// (RTCPeerConnection, mediaDevices, etc.) that livekit-client expects.
registerGlobals();

import App from './App';

registerRootComponent(App);
