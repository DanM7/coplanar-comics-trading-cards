import type { CardStats } from "@/types/card";

export type Alignment = "Good" | "Evil" | "Neutral" | "Team";

export type HomePlane = "Human" | "3D" | "2D" | "Comic";

export type HomeRegion =
  | "Human Realm"
  | "3D Geometry Realm"
  | "2D Flatlands"
  | "Comic Realm";

export type CharacterType =
  | "Human"
  | "Superhuman"
  | "Robot"
  | "Cyborg"
  | "Construct"
  | "Cartoon"
  | "Creature";

export interface CharacterDescriptionRecord {
  id: string | number;
  name: string;
  alignment: Alignment;
  description: string;
  home_plane: HomePlane;
  home_location: string;
  home_district: string;
  type?: CharacterType | string;
  identity?: string;
  is_boss?: boolean;
  first_appearance?: boolean;
}

export interface CharacterDescriptionsFile {
  descriptions: CharacterDescriptionRecord[];
}

/** @deprecated Use CharacterDescriptionRecord */
export type CharacterMasterRecord = CharacterDescriptionRecord;

export interface Character {
  id: string;
  name: string;
  alignment: Alignment;
  tier: number;
  description: string;
  home_plane: HomePlane;
  home_location: string;
  home_district: string;
  home_region: HomeRegion;
  type?: CharacterType | string;
  identity?: string;
  is_boss?: boolean;
  first_appearance?: boolean;
  stats: CardStats;
}
