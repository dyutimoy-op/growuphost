import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  itemKind: string;

  itemLabel: string;
  onConfirm: () => void;
  isPending?: boolean | undefined;

  extraWarning?: string | undefined;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  itemKind,
  itemLabel,
  onConfirm,
  isPending = false,
  extraWarning,
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-slate-900 border-white/10 text-white rounded-[2rem]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-black tracking-tighter">
            Delete this {itemKind}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400 font-medium">
            <span className="font-black text-white">{itemLabel || `Untitled ${itemKind}`}</span>{" "}
            will be permanently removed. This cannot be undone.
            {extraWarning ? (
              <span className="block mt-2 text-orange-400">{extraWarning}</span>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            disabled={isPending}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white rounded-xl font-bold"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-black px-6"
          >
            {isPending ? "Deleting..." : `Delete ${itemKind}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
