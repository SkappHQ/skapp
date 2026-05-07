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
import { useGetWorkLocations, useUpdateWorkLocation } from "~community/configurations/api/WorkLocationApi";
import GeofenceMap from "~community/configurations/components/molecules/GeofenceMap/GeofenceMap";
import WorkLocationEmployeeSelector from "~community/configurations/components/molecules/WorkLocationEmployeeSelector/WorkLocationEmployeeSelector";
import { useUnsavedChangesGuard } from "~community/configurations/hooks/useUnsavedChangesGuard";
import { WorkLocation, WorkLocationFormValues } from "~community/configurations/types/WorkLocationTypes";
import { buildWorkLocationValidationSchema } from "~community/common/utils/validationUtils";

interface Props {
  id: number;
}

const UpdateWorkLocation = ({ id }: Props) => {
  const router = useRouter();
  const translateText = useTranslator("configurations", "workLocation");

  const { data: locationsPage, isLoading } = useGetWorkLocations("", 0, 100);
  const workLocation: WorkLocation | undefined = locationsPage?.items?.find(
    (l: WorkLocation) => l.workLocationId === id
  );

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

  const { mutate: updateWorkLocation, isPending } = useUpdateWorkLocation(
    () => {
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["toasts.updateSuccess.title"]),
        description: translateText(["toasts.updateSuccess.description"]),
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
        title: translateText(["toasts.updateError.title"]),
        description: translateText(["toasts.updateError.description"]),
        isIcon: true
      });
    }
  );

  const formik = useFormik<WorkLocationFormValues>({
    initialValues: !workLocation
      ? { name: "", isAllEmployees: false, employeeIds: [], geofence: null }
      : {
          name: workLocation.name,
          isAllEmployees: workLocation.isAllEmployees,
          employeeIds: workLocation.employees?.map((e) => e.employeeId) ?? [],
          geofence: canSeeGeofence && workLocation.geofence
            ? {
                latitude: workLocation.geofence.latitude,
                longitude: workLocation.geofence.longitude,
                radiusMeters: workLocation.geofence.radiusMeters,
                address: workLocation.geofence.address ?? ""
              }
            : null
        },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      if (!workLocation) return;
      const payload = {
        ...values,
        geofence: canSeeGeofence ? values.geofence : null
      };
      updateWorkLocation({ id: workLocation.workLocationId, data: payload });
    }
  });

  formikRef.current = formik;

  const { isUnsavedModalOpen, handleResume, handleLeave, skipNextGuard } =
    useUnsavedChangesGuard(formik.dirty, router);
  skipGuardRef.current = skipNextGuard;

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
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
          className="w-full"
        />
      </div>

      <WorkLocationEmployeeSelector formik={formik} />

      {canSeeGeofence && <GeofenceMap formik={formik} />}

      <div className="flex gap-3 justify-end">
        <ButtonV2
          variant="tertiary"
          onClick={() => router.push(ROUTES.CONFIGURATIONS.BASE)}
          disabled={isPending}
        >
          {translateText(["form.cancelButton"])}
        </ButtonV2>
        <ButtonV2 variant="primary" type="submit" disabled={isPending}>
          {translateText(["form.saveChangesButton"])}
        </ButtonV2>
      </div>

      <Modal
        title={translateText(["areYouSureModalTitle"])}
        isModalOpen={isUnsavedModalOpen}
        onCloseModal={handleResume}
        isClosable={false}
      >
        <AreYouSureModal
          onPrimaryBtnClick={handleResume}
          onSecondaryBtnClick={handleLeave}
        />
      </Modal>
    </form>
  );
};

export default UpdateWorkLocation;
