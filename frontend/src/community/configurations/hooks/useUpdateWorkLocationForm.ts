import { useFormik } from "formik";
import { useRouter } from "next/router";
import * as Yup from "yup";

import { useAuth } from "~community/auth/providers/AuthProvider";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { AdminTypes } from "~community/common/types/AuthTypes";
import ROUTES from "~community/common/constants/routes";
import { useUpdateWorkLocation } from "~community/configurations/api/WorkLocationApi";
import { WorkLocation, WorkLocationFormValues } from "~community/configurations/types/WorkLocationTypes";

const useUpdateWorkLocationForm = (workLocation: WorkLocation | undefined) => {
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

  const buildInitialValues = (loc: WorkLocation | undefined): WorkLocationFormValues => {
    if (!loc) {
      return {
        name: "",
        isAllEmployees: false,
        employeeIds: [],
        geofence: undefined
      };
    }
    return {
      name: loc.name,
      isAllEmployees: loc.isAllEmployees,
      employeeIds: loc.employees?.map((e) => e.employeeId) ?? [],
      geofence: canSeeGeofence && loc.geofence
        ? {
            latitude: loc.geofence.latitude,
            longitude: loc.geofence.longitude,
            radiusMeters: loc.geofence.radiusMeters,
            address: loc.geofence.address ?? ""
          }
        : undefined
    };
  };

  const { mutate: updateWorkLocation, isPending } = useUpdateWorkLocation(
    () => {
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["toasts.updateSuccess.title"]),
        description: translateText(["toasts.updateSuccess.description"]),
        isIcon: true
      });
      router.push(ROUTES.CONFIGURATIONS.BASE);
    },
    () => {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["toasts.updateError.title"]),
        description: translateText(["toasts.updateError.description"]),
        isIcon: true
      });
    }
  );

  const formik = useFormik<WorkLocationFormValues>({
    initialValues: buildInitialValues(workLocation),
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      if (!workLocation) return;
      const payload = {
        ...values,
        geofence: canSeeGeofence ? values.geofence : undefined
      };
      updateWorkLocation({ id: workLocation.workLocationId, data: payload });
    }
  });

  return { formik, isPending, canSeeGeofence };
};

export default useUpdateWorkLocationForm;
