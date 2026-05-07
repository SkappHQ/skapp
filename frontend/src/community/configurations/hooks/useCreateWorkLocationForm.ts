import { useFormik } from "formik";
import { useRef } from "react";
import { useRouter } from "next/router";
import * as Yup from "yup";

import { useAuth } from "~community/auth/providers/AuthProvider";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { AdminTypes } from "~community/common/types/AuthTypes";
import ROUTES from "~community/common/constants/routes";
import { useCreateWorkLocation } from "~community/configurations/api/WorkLocationApi";
import { WorkLocationFormValues } from "~community/configurations/types/WorkLocationTypes";
import { useGetAttendanceConfiguration } from "~community/attendance/api/AttendanceAdminApi";

const useCreateWorkLocationForm = () => {
  const { user } = useAuth();
  const router = useRouter();
  const translateText = useTranslator("configurations", "workLocation");
  const { setToastMessage } = useToast();
  const formikRef = useRef<ReturnType<typeof useFormik<WorkLocationFormValues>> | null>(null);

  const { data: attendanceConfig } = useGetAttendanceConfiguration();

  const canSeeGeofence =
    (user?.roles?.includes(AdminTypes.SUPER_ADMIN) ||
      user?.roles?.includes(AdminTypes.ATTENDANCE_ADMIN)) &&
    attendanceConfig?.isGeoFencingEnabled === true;

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
      formikRef.current?.resetForm();
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

  formikRef.current = formik;

  return { formik, isPending, canSeeGeofence };
};

export default useCreateWorkLocationForm;
