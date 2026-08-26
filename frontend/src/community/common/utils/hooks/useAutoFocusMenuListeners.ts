import { useEffect, useRef } from "react";

const useAutoFocusMenuListener = (
  anchorEl: HTMLElement | null,
  menuId: string,
  handleClose: () => void
) => {
  const prevFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!anchorEl) {
      prevFocusedElement.current = null;
      return;
    }

    const customMenu: HTMLElement | null = document.getElementById(menuId);

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
