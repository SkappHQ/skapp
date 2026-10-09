import { useEffect, useState } from "react";

import { useGetUploadedImages } from "~community/common/api/FileHandleApi";
import { appModes } from "~community/common/constants/configs";
import { FileTypes } from "~community/common/enums/CommonEnums";
import { notificationDefaultImage } from "~community/common/types/notificationTypes";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import useS3Download from "~enterprise/common/hooks/useS3Download";

type ImageUrl = string | null;

interface UseGetImageUrl {
  (src: string, isOriginalImage?: boolean): ImageUrl;
  (srcs: string[], isOriginalImage?: boolean): string[];
}

const useGetImageUrl = ((
  srcOrSrcs: string | string[],
  isOriginalImage: boolean = false
): ImageUrl | string[] => {
  const srcs = Array.isArray(srcOrSrcs) ? srcOrSrcs : [srcOrSrcs];
  const srcsKey = srcs.join(",");

  const { s3FileUrls, downloadS3File } = useS3Download();

  const [images, setImages] = useState<ImageUrl[]>([]);

  const environment = useGetEnvironment();

  const uploadedImages = useGetUploadedImages(
    FileTypes.USER_IMAGE,
    srcs,
    true,
    environment !== appModes.ENTERPRISE
  );
  const logoUrls = uploadedImages.map((uploadedImage) => uploadedImage.data);
  const logoUrlsKey = logoUrls.join(",");

  useEffect(() => {
    setImages((prevImages) =>
      srcs.map((src, index) => {
        const logoUrl = logoUrls[index];

        if (environment === appModes.COMMUNITY) {
          if (logoUrl) return logoUrl;
          else if (src) return src;
        } else if (environment === appModes.ENTERPRISE) {
          if (src) {
            if (src === notificationDefaultImage) {
              return notificationDefaultImage;
            } else {
              return s3FileUrls[src] ?? src;
            }
          }
        }

        return prevImages[index] ?? null;
      })
    );
  }, [logoUrlsKey, srcsKey, s3FileUrls, environment]);

  useEffect(() => {
    srcs.forEach((src) => {
      if (src || !s3FileUrls[src]) {
        downloadS3File({
          filePath: src,
          isProfilePic: true,
          isOriginalImage: isOriginalImage
        });
      }
    });
  }, [srcsKey, isOriginalImage]);

  return Array.isArray(srcOrSrcs)
    ? images.map((image) => image ?? "")
    : (images[0] ?? null);
}) as UseGetImageUrl;

export default useGetImageUrl;
