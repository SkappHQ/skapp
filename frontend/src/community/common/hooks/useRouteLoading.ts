import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

const useRouteLoading = (): boolean => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const asPathRef = useRef(router.asPath);

  useEffect(() => {
    asPathRef.current = router.asPath;
  }, [router.asPath]);

  useEffect(() => {
    const handleStart = (url: string): void => {
      if (url !== asPathRef.current) {
        setLoading(true);
      }
    };

    const handleComplete = (): void => {
      setLoading(false);
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router.events]);

  return loading;
};

export default useRouteLoading;
