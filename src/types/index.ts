export type LocationType = "cafe" | "home" | "other";
export type RoastLevel = "light" | "medium" | "dark";
export type Visibility = "private" | "public";

export interface TasteCoordinates {
  tasteX: number; // -100 to +100 (渋み ↔ 酸味)
  roastY: number; // 0 to 100 (浅煎り ↔ 深煎り)
}

// Roast level to roastY default mapping
export const ROAST_LEVEL_TO_Y: Record<RoastLevel, number> = {
  light: 20,
  medium: 50,
  dark: 80,
};

// Display labels
export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  cafe: "カフェ",
  home: "自宅",
  other: "その他",
};

export const ROAST_LEVEL_LABELS: Record<RoastLevel, string> = {
  light: "浅煎り",
  medium: "中煎り",
  dark: "深煎り",
};

export const VISIBILITY_LABELS: Record<Visibility, string> = {
  private: "非公開",
  public: "公開",
};

// Common drink types for suggestions
export const DRINK_TYPE_SUGGESTIONS = [
  "ドリップ",
  "エスプレッソ",
  "ラテ",
  "カプチーノ",
  "アメリカーノ",
  "コールドブリュー",
  "フレンチプレス",
  "サイフォン",
  "エアロプレス",
  "モカポット",
];

// Taste X label helper
export function getTasteXLabel(value: number): string {
  if (value < -60) return "強い渋み";
  if (value < -30) return "渋み寄り";
  if (value < 30) return "バランス";
  if (value < 60) return "酸味寄り";
  return "強い酸味";
}

// Roast Y label helper
export function getRoastYLabel(value: number): string {
  if (value < 33) return "浅煎り";
  if (value < 66) return "中煎り";
  return "深煎り";
}
