import { useFormik } from "formik";
import { ButtonV2, InputField } from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/router";
import { useRef } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import AreYouSureModal from "~community/common/components/molecules/AreYouSureModal/AreYouSureModal";
import Modal from "~community/common/components/organisms/Modal/Modal";
import { ToastType } from "~community/common/enums/ComponentEnums";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { AdminTypes } from "~community/common/types/AuthTypes";
import { useGetAttendanceConfiguration } from "~community/attendance/api/AttendanceAdminApi";
import { useCreateWorkLocation } from "~community/configurations/api/WorkLocationApi";
import GeofenceMap from "~community/configurations/components/molecules/GeofenceMap/GeofenceMap";
import WorkLocationEmployeeSelector from "~community/configurations/components/molecules/WorkLocationEmployeeSelector/WorkLocationEmployeeSelector";
import { useUnsavedChangesGuard } from "~community/configurations/hooks/useUnsavedChangesGuard";
import { WorkLocationFormValues } from "~community/configurations/types/WorkLocationTypes";
import { buildWorkLocationValidationSchema } from "~community/common/utils/validationUtils";

const CreateWorkLocation = () => {
  const router = useRouter();
  const translateText = useTranslator("configurations", "workLocation");

  const { user } = useAuth();
  const { setToastMessage } = useToast();
  const formikRef = useRef<ReturnType<typeof useFormik<WorkLocationFormValues>> | null>(null);
  const skipGuardRef = useRef<(() => void) | null>(null);

  const { data: attendanceConfig } = useGetAttendanceConfiguration();

  const canSeeGeofence =
    (user?.roles?.includes(AdminTypes.SUPER_ADMIN) ||
      user?.roles?.includes(AdminTypes.ATTENDANCE_ADMIN)) &&
    attendanceConfig?.isGeoFencingEnabled === true;

  const validationSchema = buildWorkLocationValidationSchema(translateText);

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
      skipGuardRef.current?.();
      router.push(`${ROUTES.CONFIGURATIONS.BASE}?tab=organization`);
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
    initialValues: {
      name: "",
      isAllEmployees: false,
      employeeIds: [],
      geofence: null
    },
    validationSchema,
    onSubmit: (values) => {
      const geofence = canSeeGeofence ? values.geofence : null;
      createWorkLocation({
        name: values.name,
        address: geofence?.address ?? "",
        isAllEmployees: values.isAllEmployees,
        employeeIds: values.employeeIds,
        geofence: geofence
          ? {
              latitude: geofence.latitude.toString(),
              longitude: geofence.longitude.toString(),
              radiusMeters: geofence.radiusMeters
            }
          : null
      });
    }
  });

  formikRef.current = formik;

  const { isUnsavedModalOpen, handleResume, handleLeave, skipNextGuard } =
    useUnsavedChangesGuard(formik.dirty, router);
  skipGuardRef.current = skipNextGuard;

  return (
    <>
    <form
      onSubmit={formik.handleSubmit}
      className="flex flex-col gap-6 max-w-[40rem]"
    >
      <div>
        <InputField
          label={translateText(["form.nameLabel"])}
          placeholder={translateText(["form.namePlaceholder"])}
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          state={
            formik.touched.name && formik.errors.name ? "error" : "default"
          }
          helperText={formik.touched.name ? formik.errors.name : ""}
          name="name"
          maxLength={50}
          className="w-full"
        />
      </div>

      <WorkLocationEmployeeSelector formik={formik} />

      {canSeeGeofence && <GeofenceMap formik={formik} />}

      <div className="flex gap-3 justify-end">
        <ButtonV2
          variant="tertiary"
          type="button"
          onClick={() => router.push(ROUTES.CONFIGURATIONS.BASE)}
          disabled={isPending}
        >
          {translateText(["form.cancelButton"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          type="submit"
          disabled={isPending || !formik.isValid || !formik.dirty}
        >
          {translateText(["form.addLocationButton"])}
        </ButtonV2>
      </div>

    </form>

    <Modal
      isModalOpen={isUnsavedModalOpen}
      onCloseModal={handleResume}
      isClosable={false}
      title={translateText(["areYouSureModalTitle"])}
    >
      <AreYouSureModal
        onPrimaryBtnClick={handleResume}
        onSecondaryBtnClick={handleLeave}
      />
    </Modal>
    </>
  );
};

export default CreateWorkLocation;
