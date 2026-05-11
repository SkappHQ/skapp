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
import { useGetWorkLocationById, useUpdateWorkLocation } from "~community/configurations/api/WorkLocationApi";
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

  const { data: workLocation, isLoading } = useGetWorkLocationById(id) as {
    data: WorkLocation | undefined;
    isLoading: boolean;
  };

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
    initialValues: workLocation
      ? {
          name: workLocation.name,
          isAllEmployees: workLocation.isAllEmployees ?? false,
          employeeIds: workLocation.employees?.map((e) => e.employeeId) ?? [],
          geofence: canSeeGeofence && workLocation.geofence
            ? {
                latitude: parseFloat(workLocation.geofence.latitude),
                longitude: parseFloat(workLocation.geofence.longitude),
                radiusMeters: workLocation.geofence.radiusMeters,
                address: workLocation.address ?? ""
              }
            : null
        }
      : { name: "", isAllEmployees: false, employeeIds: [], geofence: null },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      if (!workLocation) return;
      const payload: Parameters<typeof updateWorkLocation>[0] = {
        id: workLocation.workLocationId,
        data: {
          name: values.name,
          address: canSeeGeofence ? (values.geofence?.address ?? "") : (workLocation.address ?? ""),
          isAllEmployees: values.isAllEmployees,
          employeeIds: values.employeeIds
        }
      };
      if (canSeeGeofence) {
        payload.data.geofence = values.geofence
          ? {
              latitude: values.geofence.latitude.toString(),
              longitude: values.geofence.longitude.toString(),
              radiusMeters: values.geofence.radiusMeters
            }
          : null;
      }
      updateWorkLocation(payload);
    }
  });

  formikRef.current = formik;

  const { isUnsavedModalOpen, handleResume, handleLeave, skipNextGuard } =
    useUnsavedChangesGuard(!isLoading && formik.dirty, router);
  skipGuardRef.current = skipNextGuard;

  const isFormDisabled = isLoading || isPending;

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
          disabled={isFormDisabled}
        />
      </div>

      {!isLoading && <WorkLocationEmployeeSelector formik={formik} />}

      {!isLoading && canSeeGeofence && <GeofenceMap formik={formik} />}

      <div className="flex gap-3 justify-end">
        <ButtonV2
          variant="tertiary"
          onClick={() => router.push(ROUTES.CONFIGURATIONS.BASE)}
          disabled={isFormDisabled}
        >
          {translateText(["form.cancelButton"])}
        </ButtonV2>
        <ButtonV2 variant="primary" type="submit" disabled={isFormDisabled}>
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
