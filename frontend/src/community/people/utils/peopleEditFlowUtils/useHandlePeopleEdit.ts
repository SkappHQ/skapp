import { useRouter } from "next/router";

import { useAuth } from "~community/auth/providers/AuthProvider";
import { useUploadImages } from "~community/common/api/FileHandleApi";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  useCreateCustomSkills,
  useEditEmployee
} from "~community/people/api/PeopleApi";
import useFormChangeDetector from "~community/people/hooks/useFormChangeDetector";
import { usePeopleStore } from "~community/people/store/store";
import { L1EmployeeType, SkillType } from "~community/people/types/PeopleTypes";
import {
  buildResolvedSkillUpdates,
  getNewCustomSkills
} from "~community/people/utils/skillsUtils";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";

import { handleError } from "../directoryUtils/addNewResourceFlowUtils/addNewResourceUtils";
import uploadImage from "../image/uploadImage";

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

  const { mutate: createCustomSkills } = useCreateCustomSkills();

  const translateError = useTranslator("peopleModule", "addResource");

  const editEmployee = (payload: L1EmployeeType) => {
    const skillUpdates = payload.personal?.skillUpdates;

    if (!skillUpdates) {
      mutate(payload);
      return;
    }

    const submitWithResolvedSkills = (createdCustomSkills: SkillType[]) =>
      mutate({
        ...payload,
        personal: {
          ...payload.personal,
          skillUpdates: buildResolvedSkillUpdates(
            skillUpdates,
            createdCustomSkills
          )
        }
      });

    const newCustomSkills = getNewCustomSkills(skillUpdates);

    if (newCustomSkills.length === 0) {
      submitWithResolvedSkills([]);
      return;
    }

    createCustomSkills(newCustomSkills, {
      onSuccess: submitWithResolvedSkills
    });
  };

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
      editEmployee({
        ...apiPayload,
        common: { authPic: newAuthPicURL }
      });
    } else {
      editEmployee(apiPayload);
    }
  };

  return { handleMutate };
};
