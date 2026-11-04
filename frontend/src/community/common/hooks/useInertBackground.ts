import { useEffect } from "react";

const useInertBackground = (elementId: string): void => {
  useEffect(() => {
    const backgroundElement = document.getElementById(elementId);

    backgroundElement?.setAttribute("inert", "");
    backgroundElement?.setAttribute("aria-hidden", "true");

    return () => {
      backgroundElement?.removeAttribute("inert");
      backgroundElement?.removeAttribute("aria-hidden");
    };
  }, [elementId]);
};

export default useInertBackground;
