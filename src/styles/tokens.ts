export const brandTokens = {
  colors: {
    primary: "#7c5a33",
    primaryAccent: "#c58a48",
    secondary: "#3a5a40",
    ink: "#1d1b16",
    fog: "#867c6b",
    mist: "#f6f1ea",
    midnight: "#0d0905",
  },
  typography: {
    sans: "var(--font-brand-sans)",
    serif: "var(--font-brand-serif)",
  },
  layout: {
    container: "72rem",
    radiusLg: "2.5rem",
  },
} as const;

export type BrandColor = keyof typeof brandTokens.colors;
