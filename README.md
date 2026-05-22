# Talking AI Avatar — App

Expo (React Native) frontend. **One screen:** a full-screen talking avatar with a message bar at
the bottom (text input + send button + mic button on the right).

```
┌───────────────────────────┐
│ ● Live              ✕      │   ← status pill + leave
│                           │
│        [ avatar           │
│          video ]          │
│                           │
│ ┌───────────────────────┐ │
│ │ Type a message…  ↑  🎙 │ │   ← text input + send + mic
│ └───────────────────────┘ │
└───────────────────────────┘
```

## ⚠️ This needs a dev build — NOT Expo Go

LiveKit relies on WebRTC native modules that the stock **Expo Go** app does not include. So this
project runs as an Expo **development build**. It still runs on your iPhone — you just build the
dev client once, then use `expo start --dev-client` for fast JS reloads after that.

## Setup

```bash
cp .env.example .env        # point EXPO_PUBLIC_TOKEN_URL at your token server
npm install
```

Set `EXPO_PUBLIC_TOKEN_URL` correctly (see `.env.example`):

- **iOS Simulator** + local token server → `http://localhost:3000/api/token`
- **Physical iPhone** + local token server → `http://<your-computer-LAN-IP>:3000/api/token`
  (`ipconfig getifaddr en0`; phone and computer on the same Wi-Fi)
- **Deployed token server** → `https://<project>.vercel.app/api/token`

## Run

### Option A — build & run on a connected device / simulator

```bash
npx expo run:ios          # builds the dev client and launches it
# after the first build, just:
npx expo start --dev-client
```

### Option B — EAS dev build for a physical iPhone (no Xcode project locally)

```bash
npm i -g eas-cli
eas login
eas build --profile development --platform ios
# install the build on your phone, then:
npx expo start --dev-client
```

> Make sure the **agent worker** is running (`backend/agent`, `npm run dev`) and the
> **token server** is reachable, or the avatar won't appear.

## How it works

1. Tap **Start** → the app calls the token server (`src/lib/api.ts`) for a LiveKit token.
2. `LiveKitRoom` (in `App.tsx`) connects to the room.
3. The **agent** auto-joins, runs OpenAI STT→LLM→TTS, and the **Runway avatar** publishes a
   talking-head video track.
4. `AvatarStage` subscribes to that video track and renders it full-screen.
5. The **mic button** publishes/unpublishes your audio; the **send button** delivers typed text on
   the `lk.chat` stream — both reach the agent.

## Structure

```
app/
├── index.ts                  # registerGlobals() + root registration
├── App.tsx                   # connection lifecycle + LiveKitRoom
├── app.json                  # Expo config (permissions, LiveKit plugin)
└── src/
    ├── theme.ts              # design tokens
    ├── lib/
    │   ├── config.ts         # EXPO_PUBLIC_* env
    │   └── api.ts            # token fetch
    ├── screens/
    │   └── AvatarScreen.tsx  # the single screen
    └── components/
        ├── ConnectGate.tsx   # pre-call landing + Start button
        ├── AvatarStage.tsx   # full-screen avatar video
        ├── MessageBar.tsx    # text input + send + mic
        └── StatusPill.tsx    # connection status + leave
```
