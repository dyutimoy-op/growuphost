import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

const EDITABLE_SELECTOR =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"])';

type DeterredLetter = "u" | "i" | "j" | "c";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return target.closest(EDITABLE_SELECTOR) !== null;
}

function hasTextSelection(): boolean {
  const selection = window.getSelection();
  if (selection === null || selection.isCollapsed) return false;
  return selection.toString().trim().length > 0;
}

function isFramed(): boolean {
  return window.top !== window.self;
}

function matchesLetter(event: KeyboardEvent, letter: DeterredLetter): boolean {
  if (event.metaKey && event.altKey && event.code === `Key${letter.toUpperCase()}`) {
    return true;
  }
  return event.key.toLowerCase() === letter;
}

function isDeterredCombo(event: KeyboardEvent): boolean {
  if (event.key === "F12") return true;

  const viewSourceModifiers =
    (event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey) ||
    (event.metaKey && !event.ctrlKey && !event.shiftKey);
  if (viewSourceModifiers && matchesLetter(event, "u")) return true;

  const devtoolsModifiers =
    (event.ctrlKey && event.shiftKey && !event.altKey && !event.metaKey) ||
    (event.metaKey && event.altKey && !event.ctrlKey && !event.shiftKey);
  if (
    devtoolsModifiers &&
    (matchesLetter(event, "i") || matchesLetter(event, "j") || matchesLetter(event, "c"))
  ) {
    return true;
  }

  return false;
}

export function useSourceViewDeterrent(): void {
  const isPrivateRoute = useRouterState({
    select: (state) =>
      state.matches.some(
        (match) => match.routeId === "/_authenticated" || match.routeId === "/auth",
      ),
  });

  useEffect(() => {
    if (isPrivateRoute || import.meta.env.DEV || isFramed()) return undefined;

    let lastPointerType = "mouse";

    const handlePointerDown = (event: PointerEvent): void => {
      lastPointerType = event.pointerType;
    };

    const handleContextMenu = (event: MouseEvent): void => {
      if (isEditableTarget(event.target)) return;

      if (lastPointerType !== "mouse") return;

      if (hasTextSelection()) return;
      event.preventDefault();
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (isEditableTarget(event.target)) return;
      if (!isDeterredCombo(event)) return;

      event.preventDefault();
    };

    const options: AddEventListenerOptions = { capture: true };

    window.addEventListener("pointerdown", handlePointerDown, options);
    window.addEventListener("contextmenu", handleContextMenu, options);
    window.addEventListener("keydown", handleKeyDown, options);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, options);
      window.removeEventListener("contextmenu", handleContextMenu, options);
      window.removeEventListener("keydown", handleKeyDown, options);
    };
  }, [isPrivateRoute]);
}
