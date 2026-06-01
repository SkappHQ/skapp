import { CircularProgress } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { theme } from "~community/common/theme/theme";

interface Props {
  fullPage?: boolean;
}

const ContentAreaLoader = ({ fullPage = false }: Props) => {
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
      className={`${
        fullPage ? "fixed" : "absolute"
      } inset-0 flex items-center justify-center bg-white`}
      style={{ zIndex: ZIndexEnums.MAX }}
    >
      <CircularProgress sx={{ color: theme.palette.primary.light }} />{" "}
    </div>
  );
};

export default ContentAreaLoader;
