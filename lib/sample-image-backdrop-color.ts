export const DEFAULT_OG_FRAME_BACKDROP = "#2a2a3a";

const sampleCache = new Map<string, string>();

function rgbToHex(r: number, g: number, b: number): string {
  const toByte = (channel: number) =>
    Math.min(255, Math.max(0, Math.round(channel)))
      .toString(16)
      .padStart(2, "0");

  return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
}

function medianChannel(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return sorted[mid]!;
}

function collectBorderSamples(
  data: Uint8ClampedArray,
  width: number,
  height: number
): Array<[number, number, number]> {
  const samples: Array<[number, number, number]> = [];

  const push = (x: number, y: number) => {
    const index = (y * width + x) * 4;
    const alpha = data[index + 3];
    if (alpha < 16) {
      return;
    }

    samples.push([data[index], data[index + 1], data[index + 2]]);
  };

  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }

  for (let y = 1; y < height - 1; y++) {
    push(0, y);
    push(width - 1, y);
  }

  return samples;
}

/**
 * Estimates a backdrop color by median-sampling pixels along the image border.
 * Works best when OG art has a consistent edge/letterbox color.
 */
export async function sampleImageBackdropColor(
  imageUrl: string
): Promise<string | null> {
  const trimmed = imageUrl.trim();
  if (!trimmed) {
    return null;
  }

  const cached = sampleCache.get(trimmed);
  if (cached) {
    return cached;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";

    img.onload = () => {
      try {
        const width = Math.max(8, Math.min(img.naturalWidth, 96));
        const height = Math.max(8, Math.min(img.naturalHeight, 96));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) {
          resolve(null);
          return;
        }

        context.drawImage(img, 0, 0, width, height);
        const imageData = context.getImageData(0, 0, width, height);
        const samples = collectBorderSamples(imageData.data, width, height);

        if (samples.length === 0) {
          resolve(null);
          return;
        }

        const reds = samples.map(([r]) => r);
        const greens = samples.map(([, g]) => g);
        const blues = samples.map(([, , b]) => b);
        const hex = rgbToHex(
          medianChannel(reds),
          medianChannel(greens),
          medianChannel(blues)
        );

        sampleCache.set(trimmed, hex);
        resolve(hex);
      } catch {
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
    img.src = trimmed;
  });
}

export function clearImageBackdropSampleCache(): void {
  sampleCache.clear();
}
