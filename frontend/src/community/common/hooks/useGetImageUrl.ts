import { useEffect, useState } from "react";

import { useGetUploadedImage } from "~community/common/api/FileHandleApi";
import { appModes } from "~community/common/constants/configs";
import { FileTypes } from "~community/common/enums/CommonEnums";
import { notificationDefaultImage } from "~community/common/types/notificationTypes";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import useS3Download from "~enterprise/common/hooks/useS3Download";

const useGetImageUrl = (
  src: string,
  isOriginalImage: boolean = false
): string | null => {
  const { s3FileUrls, downloadS3File } = useS3Download();

  const [image, setImage] = useState<string | null>(null);

  const environment = useGetEnvironment();

  const { data: logoUrl } = useGetUploadedImage(
    FileTypes.USER_IMAGE,
    src,
    true,
    environment !== appModes.ENTERPRISE
  );

  useEffect(() => {
    if (environment === appModes.COMMUNITY) {
      if (logoUrl) setImage(logoUrl);
      else if (src) setImage(src);
    } else if (environment === appModes.ENTERPRISE) {
      if (src) {
        if (src === notificationDefaultImage) {
          setImage(notificationDefaultImage);
        } else {
          setImage(s3FileUrls[src] ?? src);
        }
      }
    }
  }, [logoUrl, src, s3FileUrls, environment]);

  useEffect(() => {
    if (src || !s3FileUrls[src]) {
      downloadS3File({
        filePath: src,
        isProfilePic: true,
        isOriginalImage: isOriginalImage
      });
    }
  }, [src, isOriginalImage]);

  return image;
};

export default useGetImageUrl;
