import type { CardSeries, SeriesRegistry } from "./types";
import { coplanarComicsSeries1 } from "./series/coplanar-comics-series-1";

const registry: SeriesRegistry = new Map([
  [coplanarComicsSeries1.config.id, coplanarComicsSeries1],
]);

export function registerSeries(series: CardSeries): void {
  registry.set(series.config.id, series);
}

export function getSeries(seriesId: string): CardSeries | undefined {
  return registry.get(seriesId);
}

export function getDefaultSeries(): CardSeries {
  const series = registry.get(coplanarComicsSeries1.config.id);
  if (!series) {
    throw new Error("Default series not registered");
  }
  return series;
}

export function listSeriesIds(): string[] {
  return Array.from(registry.keys());
}
