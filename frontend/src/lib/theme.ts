export const themeIds = [
  "ivory",
  "marble",
  "cedar",
  "ink",
  "oak",
  "brass",
] as const;

export type ThemeId = (typeof themeIds)[number];

export const defaultTheme: ThemeId = "ivory";
export const themeCookieName = "kadoos-theme";

export type ThemeScheme = "light" | "dark";

export const themes: {
  id: ThemeId;
  scheme: ThemeScheme;
  swatch: string;
}[] = [
  { id: "ivory", scheme: "light", swatch: "#f7f3ea" },
  { id: "marble", scheme: "light", swatch: "#f3f4f6" },
  { id: "cedar", scheme: "light", swatch: "#efe4d4" },
  { id: "ink", scheme: "dark", swatch: "#1c1b19" },
  { id: "oak", scheme: "dark", swatch: "#2a211b" },
  { id: "brass", scheme: "dark", swatch: "#141311" },
];

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return themeIds.some((theme) => theme === value);
}

export function parseTheme(value: string | null | undefined): ThemeId {
  return isThemeId(value) ? value : defaultTheme;
}
