import type { HomeRegion } from "@/types/character";

export const HOME_REGIONS: HomeRegion[] = [
  "Human Realm",
  "3D Geometry Realm",
  "2D Flatlands",
  "Comic Realm",
];

export const REALM_SHORT_LABELS: Record<HomeRegion, string> = {
  "Human Realm": "Human",
  "3D Geometry Realm": "3D",
  "2D Flatlands": "2D",
  "Comic Realm": "Comic",
};

export const REALM_COLORS: Record<HomeRegion, string> = {
  "Human Realm": "#e8a87c",
  "3D Geometry Realm": "#6c9bcf",
  "2D Flatlands": "#9b59b6",
  "Comic Realm": "#f59e0b",
};
