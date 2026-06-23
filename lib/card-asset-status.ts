export interface CardAssetStatus {
  printId: string;
  front: boolean;
  back: boolean;
  frontFilename: string;
  backFilename: string;
}

export async function fetchCardAssetStatus(
  printId: string
): Promise<CardAssetStatus | null> {
  try {
    const response = await fetch(
      `/api/dev/card-assets?printId=${encodeURIComponent(printId)}`,
      { cache: "no-store" }
    );
    if (!response.ok) return null;
    return (await response.json()) as CardAssetStatus;
  } catch {
    return null;
  }
}
