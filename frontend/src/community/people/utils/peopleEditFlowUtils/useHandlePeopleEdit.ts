import { useRouter } from "next/router";

import { useUploadImages } from "~community/common/api/FileHandleApi";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useEditEmployee } from "~community/people/api/PeopleApi";
import useFormChangeDetector from "~community/people/hooks/useFormChangeDetector";
import { usePeopleStore } from "~community/people/store/store";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";

import { handleError } from "../directoryUtils/addNewResourceFlowUtils/addNewResourceUtils";
import uploadImage from "../image/uploadImage";
import { useAuth } from "~community/auth/providers/AuthProvider";

export const useHandlePeopleEdit = () => {
  const { profilePic, thumbnail, setCommonDetails } = usePeopleStore(
    (state) => state
  );

  const environment = useGetEnvironment();

  const { apiPayload } = useFormChangeDetector();

  const router = useRouter();

  let employeeId;

  const { user } = useAuth();

  const { id } = router.query;

  const asPath = router.asPath;

  if (asPath === ROUTES.PEOPLE.ACCOUNT) {
    employeeId = user?.userId;
  } else {
    employeeId = id;
  }

  const { setToastMessage } = useToast();

  const { mutate } = useEditEmployee(employeeId as string);

  const { mutateAsync: handleUploadImagesAsync } = useUploadImages();

  const translateError = useTranslator("peopleModule", "addResource");
  const handleMutate = async () => {
    if (profilePic !== null) {
      const newAuthPicURL = await uploadImage({
        environment,
        authPic: profilePic,
        thumbnail: thumbnail,
        imageUploadMutate: handleUploadImagesAsync,
        onError: () =>
          handleError({
            message: translateError(["uploadError"]),
            setToastMessage,
            translateError
          })
      });

      setCommonDetails({
        authPic: newAuthPicURL ?? ""
      });
      mutate({
        ...apiPayload,
        common: { authPic: newAuthPicURL }
      });
    } else {
      mutate(apiPayload);
    }
  };

  return { handleMutate };
};
