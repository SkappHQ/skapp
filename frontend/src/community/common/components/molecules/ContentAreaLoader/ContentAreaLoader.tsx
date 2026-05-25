import { Spinner } from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";

const ContentAreaLoader = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = (url: string): void => {
      url !== router.asPath && setLoading(true);
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
  }, [router.asPath, router.events]);

  if (!loading) return null;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-white"
      style={{ zIndex: ZIndexEnums.POPOVER }}
    >
      <Spinner size={40} />
    </div>
  );
};

export default ContentAreaLoader;
