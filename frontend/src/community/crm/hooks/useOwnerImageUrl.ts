import { useEffect, useState } from "react";
import useGetImageUrl from "~community/common/hooks/useGetImageUrl";

const useOwnerImageUrl = (authPic: string | null | undefined): string | null => {
  const imageUrl = useGetImageUrl(authPic ?? "");
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!authPic) {
      setResolvedUrl(null);
      return;
    }
    setResolvedUrl(imageUrl);
  }, [authPic, imageUrl]);

  return resolvedUrl;
};

export default useOwnerImageUrl;
