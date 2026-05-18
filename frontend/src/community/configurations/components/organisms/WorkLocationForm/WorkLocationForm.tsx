import { ButtonV2, InputField, SmallModal } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef } from "react";

import { useGetAttendanceConfiguration } from "~community/attendance/api/AttendanceAdminApi";
import { AxiosError } from "axios";

import { useAuth } from "~community/auth/providers/AuthProvider";
import ROUTES from "~community/common/constants/routes";
import { ToastType } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { AdminTypes } from "~community/common/types/AuthTypes";
import { buildWorkLocationValidationSchema } from "~community/common/utils/validationUtils";
import {
  useCheckWorkLocationNameExists,
  useCreateWorkLocation,
  useGetWorkLocationById,
  useUpdateWorkLocation
} from "~community/configurations/api/WorkLocationApi";
import GeofenceMap from "~community/configurations/components/molecules/GeofenceMap/GeofenceMap";
import WorkLocationEmployeeSelector from "~community/configurations/components/molecules/WorkLocationEmployeeSelector/WorkLocationEmployeeSelector";
import {
  COMMON_ERROR_WORK_LOCATION_NAME_ALREADY_EXISTS,
  WORK_LOCATION_SEARCH_DEBOUNCE_MS
} from "~community/configurations/constants/workLocationConstants";
import { useWorkLocationStore } from "~community/configurations/stores/workLocationStore";
import { WorkLocationFormValues } from "~community/configurations/types/WorkLocationTypes";

interface Props {
  id?: number;
}

const WorkLocationForm = ({ id }: Props) => {
  const isEditMode = id !== undefined;
  const router = useRouter();
  const translateText = useTranslator("configurations", "workLocation");
  const translateCommon = useTranslator(
    "commonComponents",
    "userPromptModal",
    "unsavedChangesModal"
  );

  const { data: workLocation, isLoading } = useGetWorkLocationById(
    id as number,
    isEditMode
  );

  const { user } = useAuth();
  const { setToastMessage } = useToast();
  const { isUnsavedModalOpen, setIsUnsavedModalOpen, setIsFormDirty } =
    useWorkLocationStore();

  const { data: attendanceConfig } = useGetAttendanceConfiguration();

  const canSeeGeofence =
    (user?.roles?.includes(AdminTypes.SUPER_ADMIN) ||
      user?.roles?.includes(AdminTypes.ATTENDANCE_ADMIN)) &&
    attendanceConfig?.isGeoFencingEnabled === true;

  const validationSchema = buildWorkLocationValidationSchema(translateText);

  const pendingNavigationRef = useRef<string | null>(null);
  const allowRouteChangeRef = useRef(false);

  const stablePreloadedEmployees = useMemo(
    () => workLocation?.employees ?? [],
    [workLocation?.employees]
  );

  const navigateBack = () => {
    router.push(`${ROUTES.CONFIGURATIONS.BASE}?tab=organization`);
  };

  const { mutate: createWorkLocation, isPending: isCreating } =
    useCreateWorkLocation(
      () => {
        setToastMessage({
          open: true,
          toastType: ToastType.SUCCESS,
          title: translateText(["toasts.createSuccess.title"]),
          description: translateText(["toasts.createSuccess.description"]),
          isIcon: true
        });
        allowRouteChangeRef.current = true;
        navigateBack();
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

  const { mutate: updateWorkLocation, isPending: isUpdating } =
    useUpdateWorkLocation(
      () => {
        setToastMessage({
          open: true,
          toastType: ToastType.SUCCESS,
          title: translateText(["toasts.updateSuccess.title"]),
          description: translateText(["toasts.updateSuccess.description"]),
          isIcon: true
        });
        allowRouteChangeRef.current = true;
        navigateBack();
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

  const isPending = isCreating || isUpdating;

  const getInitialValues = (): WorkLocationFormValues => {
    if (isEditMode && workLocation) {
      const geofence =
        canSeeGeofence && workLocation.geofence
          ? {
              latitude: Number.parseFloat(workLocation.geofence.latitude),
              longitude: Number.parseFloat(workLocation.geofence.longitude),
              radiusMeters: workLocation.geofence.radiusMeters,
              address: workLocation.address ?? ""
            }
          : null;

      return {
        name: workLocation.name,
        isAllEmployees: workLocation.isAllEmployees ?? false,
        employeeIds: workLocation.employees?.map((e) => e.employeeId) ?? [],
        geofence
      };
    }

    return { name: "", isAllEmployees: false, employeeIds: [], geofence: null };
  };

  const formik = useFormik<WorkLocationFormValues>({
    initialValues: getInitialValues(),
    enableReinitialize: isEditMode,
    validationSchema,
    onSubmit: (values) => {
      const geofence = canSeeGeofence ? values.geofence : null;

      if (isEditMode && workLocation) {
        const payload: Parameters<typeof updateWorkLocation>[0] = {
          id: workLocation.workLocationId,
          data: {
            name: values.name,
            address: canSeeGeofence
              ? (values.geofence?.address ?? "")
              : (workLocation.address ?? ""),
            isAllEmployees: values.isAllEmployees,
            employeeIds: values.isAllEmployees ? [] : values.employeeIds
          }
        };
        if (canSeeGeofence) {
          payload.data.geofence = geofence
            ? {
                latitude: geofence.latitude.toString(),
                longitude: geofence.longitude.toString(),
                radiusMeters: geofence.radiusMeters
              }
            : null;
        }
        updateWorkLocation(payload);
      } else {
        createWorkLocation({
          name: values.name,
          address: geofence?.address ?? "",
          isAllEmployees: values.isAllEmployees,
          employeeIds: values.isAllEmployees ? [] : values.employeeIds,
          geofence: geofence
            ? {
                latitude: geofence.latitude.toString(),
                longitude: geofence.longitude.toString(),
                radiusMeters: geofence.radiusMeters
              }
            : null
        });
      }
    }
  });

  const debouncedName = useDebounce(
    formik.values.name.trim(),
    WORK_LOCATION_SEARCH_DEBOUNCE_MS
  );

  const { data: nameCheckResult, error: nameCheckError } =
    useCheckWorkLocationNameExists(
      debouncedName,
      debouncedName.length > 0 &&
        !(isEditMode && debouncedName === workLocation?.name)
    );

  const isNameDuplicate =
    (nameCheckResult?.isExists === true ||
      (nameCheckError instanceof AxiosError &&
        nameCheckError.response?.data?.results?.[0]?.messageKey ===
          COMMON_ERROR_WORK_LOCATION_NAME_ALREADY_EXISTS)) &&
    !(isEditMode && debouncedName === workLocation?.name);
  const isNameCheckPending = formik.values.name.trim() !== debouncedName;

  const handleLeave = () => {
    setIsUnsavedModalOpen(false);
    allowRouteChangeRef.current = true;
    const target = pendingNavigationRef.current;
    pendingNavigationRef.current = null;
    if (target) {
      router.push(target);
    } else {
      navigateBack();
    }
  };

  const handleResume = () => {
    setIsUnsavedModalOpen(false);
    pendingNavigationRef.current = null;
  };

  const isDirtyRef = useRef(formik.dirty);

  useEffect(() => {
    isDirtyRef.current = formik.dirty;
  });

  useEffect(() => {
    setIsFormDirty(formik.dirty);
  }, [formik.dirty, setIsFormDirty]);

  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      if (allowRouteChangeRef.current) {
        allowRouteChangeRef.current = false;
        return;
      }
      if (isDirtyRef.current && url !== router.asPath) {
        pendingNavigationRef.current = url;
        setIsUnsavedModalOpen(true);
        router.events.emit("routeChangeError");
        throw "Abort route change";
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault();
      }
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [router, setIsUnsavedModalOpen]);

  useEffect(() => {
    router.beforePopState(({ url }) => {
      if (allowRouteChangeRef.current) {
        allowRouteChangeRef.current = false;
        return true;
      }
      if (isDirtyRef.current) {
        pendingNavigationRef.current = url;
        setIsUnsavedModalOpen(true);
        globalThis.history.pushState(null, "", router.asPath);
        return false;
      }
      return true;
    });

    return () => {
      router.beforePopState(() => true);
    };
  }, [router, setIsUnsavedModalOpen]);

  useEffect(() => {
    return () => {
      setIsFormDirty(false);
      setIsUnsavedModalOpen(false);
    };
  }, [setIsFormDirty, setIsUnsavedModalOpen]);

  const isFormDisabled = isLoading || isPending;

  if (isEditMode && isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-[40rem] animate-pulse">
        <div>
          <div className="h-4 w-24 rounded bg-secondary-accent mb-2" />
          <div className="h-10 w-full rounded bg-secondary-accent" />
        </div>
        <div>
          <div className="h-4 w-32 rounded bg-secondary-accent mb-2" />
          <div className="h-10 w-full rounded bg-secondary-accent" />
        </div>
        {canSeeGeofence && (
          <div className="h-64 w-full rounded bg-secondary-accent" />
        )}
        <div className="flex justify-start gap-3">
          <div className="h-10 w-24 rounded bg-secondary-accent" />
          <div className="h-10 w-32 rounded bg-secondary-accent" />
        </div>
      </div>
    );
  }

  const nameFieldHelperText =
    formik.touched.name && formik.errors.name
      ? formik.errors.name
      : isNameDuplicate
        ? translateText(["validation.nameAlreadyExists"])
        : "";

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
            state={nameFieldHelperText ? "error" : "default"}
            helperText={nameFieldHelperText}
            name="name"
            maxLength={50}
            className="w-full"
            disabled={isLoading}
            required
          />
        </div>

        <WorkLocationEmployeeSelector
          formik={formik}
          preloadedEmployees={stablePreloadedEmployees}
        />

        {canSeeGeofence && <GeofenceMap formik={formik} />}

        <div className="flex justify-start gap-3">
          {isEditMode && (
            <ButtonV2
              variant="tertiary"
              type="button"
              onClick={() => formik.resetForm()}
              disabled={isPending || !formik.dirty}
            >
              {translateText(["form.cancelButton"])}
            </ButtonV2>
          )}
          <ButtonV2
            variant="primary"
            type="submit"
            disabled={
              isFormDisabled ||
              !formik.isValid ||
              !formik.dirty ||
              isNameDuplicate ||
              isNameCheckPending
            }
          >
            {isEditMode
              ? translateText(["form.saveChangesButton"])
              : translateText(["form.addLocationButton"])}
          </ButtonV2>
        </div>
      </form>

      <SmallModal
        isOpen={isUnsavedModalOpen}
        onClose={handleResume}
        modalHeader={translateText(["areYouSureModalTitle"])}
        content={<p>{translateCommon(["description"])}</p>}
        buttons={{
          buttonLeft: {
            variant: "tertiary",
            onClick: handleLeave,
            children: translateCommon(["leaveAnywayBtn"])
          },
          buttonRight: {
            variant: "primary",
            onClick: handleResume,
            children: translateCommon(["resumeTaskBtn"])
          }
        }}
      />
    </>
  );
};

export default WorkLocationForm;
