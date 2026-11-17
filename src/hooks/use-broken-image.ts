import { useCallback, useState } from "react";

function hasAlreadyFailed(node: HTMLImageElement | HTMLVideoElement): boolean {
  if (node instanceof HTMLImageElement) {
    return node.complete && node.naturalWidth === 0;
  }
  return node.error !== null || node.networkState === HTMLMediaElement.NETWORK_NO_SOURCE;
}

export function useBrokenImage(url: string | null | undefined): {
  isBroken: boolean;

  handleError: () => void;

  mediaRef: (node: HTMLImageElement | HTMLVideoElement | null) => void;
} {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const isBroken = url !== null && url !== undefined && url === failedUrl;

  const handleError = useCallback(() => {
    if (url === null || url === undefined) return;
    setFailedUrl(url);
  }, [url]);

  const mediaRef = useCallback(
    (node: HTMLImageElement | HTMLVideoElement | null): void => {
      if (node === null || url === null || url === undefined) return;
      if (hasAlreadyFailed(node)) setFailedUrl(url);
    },
    [url],
  );

  return { isBroken, handleError, mediaRef };
}
