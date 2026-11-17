import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "./admin-utils";

export interface ConfirmDeleteController<T> {
  pending: T | null;

  request: (target: T) => void;

  cancel: () => void;

  confirm: () => void;
  isPending: boolean;
}

export function useConfirmDelete<T extends { id: string }>(config: {
  remove: (target: T) => Promise<void>;
  onDeleted: (target: T) => void;
  errorFallback: string;
}): ConfirmDeleteController<T> {
  const [pending, setPending] = useState<T | null>(null);

  const mutation = useMutation({
    mutationFn: config.remove,
    onSuccess: (_result, target) => {
      config.onDeleted(target);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, config.errorFallback));
    },
    onSettled: () => {
      setPending(null);
    },
  });

  return {
    pending,
    request: (target: T) => setPending(target),
    cancel: () => {
      if (!mutation.isPending) setPending(null);
    },
    confirm: () => {
      if (pending !== null) mutation.mutate(pending);
    },
    isPending: mutation.isPending,
  };
}
