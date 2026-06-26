import { useEffect } from "react";

const useAutoFocusMenuListener = (
  anchorEl: HTMLElement | null,
  menuId: string,
  handleClose: () => void
) => {
  let prevFocusedElement: HTMLElement | null;

  useEffect(() => {
    const customMenu: HTMLElement | null = document.getElementById(menuId);

    if (anchorEl && customMenu) {
      prevFocusedElement = document.activeElement as HTMLElement;
      customMenu.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
        if (prevFocusedElement) {
          prevFocusedElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [anchorEl]);
};

export default useAutoFocusMenuListener;
