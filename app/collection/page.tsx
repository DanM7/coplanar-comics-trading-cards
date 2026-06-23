"use client";

import { useCollection } from "@/hooks/useCollection";
import { useAuth } from "@/hooks/useAuth";

export default function CollectionPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { collection, isLoading, error } = useCollection();

  if (authLoading || isLoading) {
    return <p>Loading collection…</p>;
  }

  if (!isAuthenticated) {
    return <p>Sign in to view your card collection.</p>;
  }

  if (error) {
    return <p style={{ color: "var(--error)" }}>{error}</p>;
  }

  if (!collection) {
    return <p>No collection data.</p>;
  }

  return (
    <>
      <div className="collection-summary">
        <div className="stat-card">
          <strong>{collection.totalUnique}</strong>
          Unique cards
        </div>
        <div className="stat-card">
          <strong>{collection.totalCards}</strong>
          Total cards
        </div>
        <div className="stat-card">
          <strong>
            {collection.cards.filter((c) => c.quantity > 1).length}
          </strong>
          With duplicates
        </div>
      </div>
      <ul className="collection-list">
        {collection.cards
          .sort((a, b) => a.cardId.localeCompare(b.cardId))
          .map((entry) => (
            <li key={entry.cardId}>
              <span>{entry.card?.front.name ?? entry.cardId}</span>
              <span>×{entry.quantity}</span>
            </li>
          ))}
      </ul>
    </>
  );
}
