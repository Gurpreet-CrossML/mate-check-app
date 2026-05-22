/** Central design tokens for the app. Dark, modern, high-contrast. */
export const theme = {
  colors: {
    bg: '#0B0B12',
    surface: 'rgba(255,255,255,0.06)',
    surfaceStrong: 'rgba(255,255,255,0.10)',
    border: 'rgba(255,255,255,0.12)',
    text: '#FFFFFF',
    textMuted: 'rgba(255,255,255,0.55)',
    accent: '#7C5CFF',
    accentPressed: '#6A4BEF',
    danger: '#FF4D5E',
    success: '#3CCB7F',
  },
  radius: {
    sm: 10,
    md: 16,
    lg: 24,
    pill: 999,
  },
  spacing: (n: number) => n * 4,
} as const;

export type Theme = typeof theme;
