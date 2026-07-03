import type { GeneratedCard } from "@/types/card";
import { CardFlip } from "./CardFlip";

interface TradingCardProps {
  card: GeneratedCard;
  compact?: boolean;
  interactive?: boolean;
  flipped?: boolean;
  onFlipChange?: (flipped: boolean) => void;
}

/**
 * Primary card display component — wraps front/back with flip interaction.
 */
export function TradingCard({
  card,
  compact,
  interactive = true,
  flipped,
  onFlipChange,
}: TradingCardProps) {
  if (!interactive) {
    return <CardFlip card={card} compact={compact} defaultFlipped={false} />;
  }

  return (
    <CardFlip
      card={card}
      compact={compact}
      flipped={flipped}
      onFlipChange={onFlipChange}
    />
  );
}
