import { useFormik } from "formik";
import { useRouter } from "next/router";
import * as Yup from "yup";

import { useAuth } from "~community/auth/providers/AuthProvider";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { AdminTypes } from "~community/common/types/AuthTypes";
import ROUTES from "~community/common/constants/routes";
import { useCreateWorkLocation } from "~community/configurations/api/WorkLocationApi";
import { WorkLocationFormValues } from "~enterprise/configurations/types/WorkLocationTypes";

const useCreateWorkLocationForm = () => {
  const { user } = useAuth();
  const router = useRouter();
  const translateText = useTranslator("configurations", "workLocation");
  const { setToastMessage } = useToast();

  const canSeeGeofence =
    user?.roles?.includes(AdminTypes.SUPER_ADMIN) ||
    user?.roles?.includes(AdminTypes.ATTENDANCE_ADMIN);

  const validationSchema = Yup.object({
    name: Yup.string()
      .required(translateText(["validation.nameRequired"]))
      .max(50, translateText(["validation.nameMaxLength"]))
      .matches(/^[a-zA-Z0-9 ]+$/, translateText(["validation.nameInvalidChars"]))
  });

  const initialValues: WorkLocationFormValues = {
    name: "",
    isAllEmployees: false,
    employeeIds: [],
    geofence: undefined
  };

  const { mutate: createWorkLocation, isPending } = useCreateWorkLocation(
    () => {
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["toasts.createSuccess.title"]),
        description: translateText(["toasts.createSuccess.description"]),
        isIcon: true
      });
      router.push(ROUTES.CONFIGURATIONS.BASE);
    },
    () => {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["toasts.createError.title"]),
        description: translateText(["toasts.createError.description"]),
        isIcon: true
      });
    }
  );

  const formik = useFormik<WorkLocationFormValues>({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      const payload = {
        ...values,
        geofence: canSeeGeofence ? values.geofence : undefined
      };
      createWorkLocation(payload);
    }
  });

  return { formik, isPending, canSeeGeofence };
};

export default useCreateWorkLocationForm;
