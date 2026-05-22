/**
 * Runtime config sourced from Expo public env vars (EXPO_PUBLIC_*).
 * Set these in `app/.env` — see `.env.example`.
 */
export const config = {
  /** Full URL of the token server's token endpoint. */
  tokenUrl:
    process.env.EXPO_PUBLIC_TOKEN_URL ?? 'http://localhost:3000/api/token',
};

if (!process.env.EXPO_PUBLIC_TOKEN_URL) {
  console.warn(
    '[config] EXPO_PUBLIC_TOKEN_URL is not set — falling back to http://localhost:3000/api/token. ' +
      'On a physical device, localhost points at the phone, not your computer. Use your machine\'s LAN IP or the deployed Vercel URL.',
  );
}
