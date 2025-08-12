import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const useBlockPageReload = (): boolean => {
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      sessionStorage.setItem("redirectAfterReload", "true");
    };

    const shouldRedirect = sessionStorage.getItem("redirectAfterReload");
    if (shouldRedirect) {
      sessionStorage.removeItem("redirectAfterReload");

      // Redirect before showing content
      if (window.history.length > 1) {
        router.back();
      } else {
        router.replace("/"); // fallback
      }
      return; // do not continue; block rendering
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    setShouldRender(true); // safe to render

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [router]);

  return shouldRender;
};

export default useBlockPageReload;
