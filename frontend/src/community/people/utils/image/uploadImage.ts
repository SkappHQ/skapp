import { UseMutateAsyncFunction } from "@tanstack/react-query";

import { appModes } from "~community/common/constants/configs";
import { ErrorResponse } from "~community/common/types/CommonTypes";
import { ModifiedFileType } from "~community/people/types/AddNewResourceTypes";
import { FileCategories } from "~enterprise/common/types/s3Types";
import { uploadFileToS3ByUrl } from "~enterprise/common/utils/awsS3ServiceFunctions";

interface UploadImageProps {
  isAnExistingResource?: boolean;
  environment: string | undefined;
  authPic: [] | ModifiedFileType[] | string | null | undefined;
  thumbnail: [] | ModifiedFileType[] | string | null | undefined;
  imageUploadMutate: UseMutateAsyncFunction<any, Error, FormData, unknown>;
  setHasUploadStarted?: (value: boolean) => void;
  onError: any;
}

const uploadImage = async ({
  isAnExistingResource = false,
  environment,
  authPic,
  thumbnail,
  imageUploadMutate,
  onError,
  setHasUploadStarted
}: UploadImageProps) => {
  let newAuthPicURL = "";

  if (typeof authPic === "object" && authPic && authPic?.length > 0) {
    try {
      setHasUploadStarted?.(true);

      if (environment === appModes.COMMUNITY) {
        const formData = new FormData();
        formData.append("file", authPic[0] as ModifiedFileType);
        formData.append("type", "USER_IMAGE");

        await imageUploadMutate(formData).then((response: ErrorResponse) => {
          const filePath = response.message?.split(
            "File uploaded successfully: "
          )[1];
          if (filePath) {
            const fileName = filePath.split("/").pop();
            if (fileName) {
              newAuthPicURL = fileName;
            }
          }
        });
      } else {
        await uploadFileToS3ByUrl(
          authPic[0] as File,
          FileCategories.PROFILE_PICTURES_ORIGINAL
        );

        if (
          typeof thumbnail === "object" &&
          thumbnail &&
          thumbnail?.length > 0
        ) {
          const thumbnailURL = await uploadFileToS3ByUrl(
            thumbnail[0],
            FileCategories.PROFILE_PICTURES_THUMBNAIL
          );

          newAuthPicURL = thumbnailURL.split("/").slice(2).join("/");
        }
      }

      setHasUploadStarted?.(false);
    } catch (error) {
      onError();
    }
  } else if (isAnExistingResource) {
    newAuthPicURL = (authPic as string) ?? "";
  }

  return newAuthPicURL;
};

export default uploadImage;
