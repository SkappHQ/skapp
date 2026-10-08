import { useEffect, useState } from "react";

import { useGetUploadedImages } from "~community/common/api/FileHandleApi";
import { appModes } from "~community/common/constants/configs";
import { FileTypes } from "~community/common/enums/CommonEnums";
import { notificationDefaultImage } from "~community/common/types/notificationTypes";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import useS3Download from "~enterprise/common/hooks/useS3Download";

const useGetImageUrls = (
  srcs: string[],
  isOriginalImage: boolean = false
): string[] => {
  const { s3FileUrls, downloadS3File } = useS3Download();

  const [images, setImages] = useState<string[]>([]);

  const environment = useGetEnvironment();

  const { data: logoUrls } = useGetUploadedImages(
    FileTypes.USER_IMAGE,
    srcs,
    true,
    environment !== appModes.ENTERPRISE
  );

  const srcsKey = srcs.join(",");

  useEffect(() => {
    if (environment === appModes.COMMUNITY) {
      setImages(srcs.map((src, index) => logoUrls?.[index] ?? src));
    } else if (environment === appModes.ENTERPRISE) {
      setImages(
        srcs.map((src) => {
          if (!src) return "";
          if (src === notificationDefaultImage) return notificationDefaultImage;
          return s3FileUrls[src] ?? src;
        })
      );
    }
  }, [logoUrls, srcsKey, s3FileUrls, environment]);

  useEffect(() => {
    if (environment !== appModes.ENTERPRISE) return;

    new Set(srcs.filter(Boolean)).forEach((src) =>
      downloadS3File({
        filePath: src,
        isProfilePic: true,
        isOriginalImage: isOriginalImage
      })
    );
  }, [srcsKey, isOriginalImage, environment]);

  return images;
};

export default useGetImageUrls;
