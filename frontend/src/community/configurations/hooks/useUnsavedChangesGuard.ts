import { NextRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

interface UseUnsavedChangesGuardReturn {
  isUnsavedModalOpen: boolean;
  handleResume: () => void;
  handleLeave: () => void;
  skipNextGuard: () => void;
}

export const useUnsavedChangesGuard = (
  isDirty: boolean,
  router: NextRouter
): UseUnsavedChangesGuardReturn => {
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const bypassRef = useRef(false);

  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      if (bypassRef.current) {
        bypassRef.current = false;
        return;
      }
      if (isDirty) {
        setPendingUrl(url);
        setIsUnsavedModalOpen(true);
        router.events.emit("routeChangeError");
        throw new Error("routeChange aborted");
      }
    };
    router.events.on("routeChangeStart", handleRouteChangeStart);
    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
    };
  }, [isDirty, router]);

  const handleResume = () => {
    setIsUnsavedModalOpen(false);
    setPendingUrl(null);
  };

  const handleLeave = () => {
    setIsUnsavedModalOpen(false);
    if (pendingUrl) {
      router.push(pendingUrl);
    }
  };

  const skipNextGuard = () => {
    bypassRef.current = true;
  };

  return { isUnsavedModalOpen, handleResume, handleLeave, skipNextGuard };
};
