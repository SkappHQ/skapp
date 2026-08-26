import { useEffect, useRef } from "react";

const useAutoFocusMenuListener = (
  anchorEl: HTMLElement | null,
  menuId: string,
  handleClose: () => void
) => {
  const prevFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Only listen while the menu is open, otherwise Escape anywhere on the
    // page triggers handleClose and its side effects.
    if (!anchorEl) {
      prevFocusedElement.current = null;
      return;
    }

    const customMenu: HTMLElement | null = document.getElementById(menuId);

    // Captured once per open: re-running the effect would otherwise record the
    // menu itself as the element to restore focus to.
    if (customMenu && !prevFocusedElement.current) {
      prevFocusedElement.current = document.activeElement as HTMLElement;
      customMenu.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
        prevFocusedElement.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [anchorEl, menuId, handleClose]);
};

export default useAutoFocusMenuListener;
