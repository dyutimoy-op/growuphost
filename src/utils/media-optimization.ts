export const MAX_WIDTH = 1200;
export const MAX_HEIGHT = 1200;
export const QUALITY = 0.8;
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const RESIZABLE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const PASSTHROUGH_IMAGE_TYPES = ["image/gif"] as const;

export const SUPPORTED_IMAGE_TYPES: readonly string[] = [
  ...RESIZABLE_IMAGE_TYPES,
  ...PASSTHROUGH_IMAGE_TYPES,
];
export const SUPPORTED_VIDEO_TYPES: readonly string[] = ["video/mp4", "video/webm", "video/ogg"];

export const ACCEPTED_UPLOAD_TYPES = [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_VIDEO_TYPES].join(",");

export const ACCEPTED_IMAGE_TYPES = SUPPORTED_IMAGE_TYPES.join(",");

export function allowedTypesFromAccept(accept: string): readonly string[] {
  const all = [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_VIDEO_TYPES];
  const tokens = accept
    .toLowerCase()
    .split(",")
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
  if (tokens.length === 0) return all;

  const allowed = all.filter((type) =>
    tokens.some((token) =>
      token.endsWith("/*") ? type.startsWith(token.slice(0, -1)) : token === type,
    ),
  );
  return allowed.length > 0 ? allowed : all;
}

const FRIENDLY_NAME_BY_MIME: Readonly<Record<string, string>> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WebP",
  "image/gif": "GIF",
  "video/mp4": "MP4",
  "video/webm": "WebM",
  "video/ogg": "OGG",
};

function describeTypes(types: readonly string[]): string {
  return types.map((type) => FRIENDLY_NAME_BY_MIME[type] ?? type).join(", ");
}

export interface OptimizationResult {
  file: File;

  isOptimized: boolean;
  originalSize: number;
  optimizedSize: number;
}

export function isResizableImage(type: string): boolean {
  return (RESIZABLE_IMAGE_TYPES as readonly string[]).includes(type.toLowerCase());
}

export const validateFile = (
  file: File,
  allowedTypes?: readonly string[],
): { valid: boolean; error?: string } => {
  const types = allowedTypes ?? [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_VIDEO_TYPES];

  if (!types.includes(file.type.toLowerCase())) {
    const described = file.type.length > 0 ? file.type : `“${file.name}”`;
    return {
      valid: false,
      error: `${described} is not a supported file type. Use one of: ${describeTypes(types)}.`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB. Max limit: 10MB`,
    };
  }

  return { valid: true };
};

async function decodeImage(objectUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const node = new Image();
    node.onload = () => resolve(node);
    node.onerror = () => reject(new Error("The image could not be decoded"));
    node.src = objectUrl;
  });
}

type ResizeOutcome =
  { kind: "within-cap" } | { kind: "resized"; file: File } | { kind: "unavailable" };

async function resizeWithinCap(file: File): Promise<ResizeOutcome> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await decodeImage(objectUrl);
    if (img.naturalWidth === 0 || img.naturalHeight === 0) return { kind: "unavailable" };
    if (img.naturalWidth <= MAX_WIDTH && img.naturalHeight <= MAX_HEIGHT) {
      return { kind: "within-cap" };
    }

    const scale = Math.min(MAX_WIDTH / img.naturalWidth, MAX_HEIGHT / img.naturalHeight);

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));

    const ctx = canvas.getContext("2d");
    if (!ctx) return { kind: "unavailable" };
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, file.type, QUALITY);
    });

    if (blob === null || blob.type !== file.type) return { kind: "unavailable" };

    return { kind: "resized", file: new File([blob], file.name, { type: file.type }) };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export const optimizeImage = async (file: File): Promise<OptimizationResult> => {
  const unchanged: OptimizationResult = {
    file,
    isOptimized: false,
    originalSize: file.size,
    optimizedSize: file.size,
  };

  if (!isResizableImage(file.type)) return unchanged;

  let outcome: ResizeOutcome;
  try {
    outcome = await resizeWithinCap(file);
  } catch {
    outcome = { kind: "unavailable" };
  }

  if (outcome.kind !== "resized") return unchanged;

  return {
    file: outcome.file,
    isOptimized: true,
    originalSize: file.size,
    optimizedSize: outcome.file.size,
  };
};
