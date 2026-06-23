import type { GeneratedCard } from "./card";

export interface UserCardEntry {
  cardId: string;
  quantity: number;
  card?: GeneratedCard;
}

export interface UserCollection {
  userId: string;
  cards: UserCardEntry[];
  totalUnique: number;
  totalCards: number;
}

export interface PackOpenResult {
  packId?: string;
  cardIds: string[];
  cards: GeneratedCard[];
  openedAt: string;
  savedToCollection?: boolean;
}

export interface BinderSlot {
  cardId: string;
  printId: string;
  owned: boolean;
  quantity: number;
  card?: GeneratedCard;
  isCollectible: boolean;
}

export interface BinderPage {
  pageIndex: number;
  slots: BinderSlot[];
}
