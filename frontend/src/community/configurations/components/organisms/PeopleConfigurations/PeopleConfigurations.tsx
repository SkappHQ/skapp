import { Box } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import SwitchRow from "~community/common/components/atoms/SwitchRow/SwitchRow";
import { appModes } from "~community/common/constants/configs";
import { ToastType } from "~community/common/enums/ComponentEnums";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import {
  useGetBirthdayNotificationConfig,
  useUpdateBirthdayNotificationConfig
} from "~community/people/api/PeopleApi";
import { BirthdayNotificationConfigType } from "~community/people/types/PeopleConfigTypes";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import GoogleWorkspaceSyncSettings from "~enterprise/configurations/components/organisms/GoogleWorkspaceSyncSettings/GoogleWorkspaceSyncSettings";
import { useEnterprisePeopleStore } from "~enterprise/people/store/enterprisePeopleStore";

const PeopleConfigurations: FC = () => {
  const translateText = useTranslator(
    "configurations",
    "people",
    "birthdayNotificationSection"
  );
  const translateButtons = useTranslator("configurations", "people", "buttons");
  const { setToastMessage } = useToast();

  const isEnterprise = useGetEnvironment() === appModes.ENTERPRISE;
  const { isSuperAdmin } = useSessionData();
  const canManageGoogleWorkspace = isEnterprise && !!isSuperAdmin;

  const {
    setIsWorkspaceSaveTriggered,
    setIsWorkspaceResetTriggered,
    isWorkspaceDirty,
    isWorkspaceSubmitting
  } = useEnterprisePeopleStore((store) => ({
    setIsWorkspaceSaveTriggered: store.setIsPeopleWorkspaceSaveTriggered,
    setIsWorkspaceResetTriggered: store.setIsPeopleWorkspaceResetTriggered,
    isWorkspaceDirty: store.isPeopleWorkspaceDirty,
    isWorkspaceSubmitting: store.isPeopleWorkspaceSubmitting
  }));

  const {
    data: birthdayNotificationConfig,
    isLoading,
    isError
  } = useGetBirthdayNotificationConfig();

  const handleSuccess = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["toastMessages", "successTitle"]),
      description: translateText(["toastMessages", "successDescription"])
    });
  };

  const handleError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toastMessages", "errorTitle"]),
      description: translateText(["toastMessages", "errorDescription"])
    });
  };

  const { mutateAsync: updateConfigAsync, isPending } =
    useUpdateBirthdayNotificationConfig(handleSuccess, handleError);

  const birthdayFormik = useFormik<BirthdayNotificationConfigType>({
    enableReinitialize: true,
    initialValues: {
      isTurnedOn: birthdayNotificationConfig?.isTurnedOn ?? false,
      isTeamWide: birthdayNotificationConfig?.isTeamWide ?? false,
      isOrganizationWide: birthdayNotificationConfig?.isOrganizationWide ?? false
    },
    onSubmit: async (values) => {
      await updateConfigAsync(values);
    }
  });

  const isBirthdaySectionLoaded =
    isError || (!isLoading && !!birthdayNotificationConfig);

  const isWorkspaceChanged = canManageGoogleWorkspace && isWorkspaceDirty;
  const isAnyChanged = birthdayFormik.dirty || isWorkspaceChanged;
  const isAnySubmitting =
    isPending || (canManageGoogleWorkspace && isWorkspaceSubmitting);

  const handleCancelAll = () => {
    if (birthdayFormik.dirty) birthdayFormik.resetForm();
    if (isWorkspaceChanged) setIsWorkspaceResetTriggered(true);
  };

  const handleSaveAll = async () => {
    if (birthdayFormik.dirty) {
      await birthdayFormik.submitForm();
    }
    if (isWorkspaceChanged) {
      setIsWorkspaceSaveTriggered(true);
    }
  };

  const handleMainToggleChange = (checked: boolean) => {
    birthdayFormik.setFieldValue("isTurnedOn", checked);
    if (checked) {
      birthdayFormik.setFieldValue("isTeamWide", true);
      birthdayFormik.setFieldValue("isOrganizationWide", true);
    }
  };

  const subOptionsAriaMessage = birthdayNotificationConfig
    ? translateText([
        "aria",
        birthdayFormik.values.isTurnedOn
          ? "subOptionsAvailable"
          : "subOptionsUnavailable"
      ])
    : "";

  return (
    <div className="flex w-196 flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="subtitle2 text-black">{translateText(["title"])}</h2>
        <p className="body1 text-secondary-text">
          {translateText(["description"])}
        </p>
      </div>

      <div className="sr-only" role="status" aria-live="polite">
        {subOptionsAriaMessage}
      </div>

      {!isError && (isLoading || !birthdayNotificationConfig) && (
        <div
          className="flex animate-pulse flex-col gap-6"
          role="status"
          aria-busy="true"
          aria-live="polite"
          aria-label={translateText(["aria", "loading"])}
        >
          <div className="flex items-center justify-between">
            <div className="h-5 w-64 rounded-lg bg-secondary-accent" />
            <div className="h-7 w-14 rounded-full bg-secondary-accent" />
          </div>
          <div className="flex flex-row gap-4">
            <div className="h-10 w-28 rounded-lg bg-secondary-accent" />
            <div className="h-10 w-36 rounded-lg bg-secondary-accent" />
          </div>
        </div>
      )}

      {!isError && birthdayNotificationConfig && (
        <div className="flex flex-col gap-6">
          <SwitchRow
            label={translateText(["mainToggleLabel"])}
            labelId="birthday-notification"
            arialabel={translateText(["aria", "mainToggle"])}
            checked={birthdayFormik.values.isTurnedOn}
            onChange={handleMainToggleChange}
          />
          {birthdayFormik.values.isTurnedOn && (
            <>
              <SwitchRow
                label={translateText(["teamToggleLabel"])}
                labelId="birthday-notification-team-only"
                arialabel={translateText(["aria", "teamToggle"])}
                tooltip={translateText(["teamToggleTooltip"])}
                checked={birthdayFormik.values.isTeamWide}
                onChange={(checked) =>
                  birthdayFormik.setFieldValue("isTeamWide", checked)
                }
              />
              <SwitchRow
                label={translateText(["organizationToggleLabel"])}
                labelId="birthday-notification-entire-organization"
                arialabel={translateText(["aria", "organizationToggle"])}
                tooltip={translateText(["organizationToggleTooltip"])}
                checked={birthdayFormik.values.isOrganizationWide}
                onChange={(checked) =>
                  birthdayFormik.setFieldValue("isOrganizationWide", checked)
                }
              />
            </>
          )}
        </div>
      )}

      {canManageGoogleWorkspace && <GoogleWorkspaceSyncSettings />}

      {isBirthdaySectionLoaded && (
        <Box sx={{ display: "flex", flexDirection: "row", gap: "0.75rem" }}>
          <ButtonV2
            variant="tertiary"
            disabled={!isAnyChanged || isAnySubmitting}
            onClick={handleCancelAll}
            icon={<Icon name={IconName.CLOSE_ICON} />}
            iconPosition="end"
          >
            {translateButtons(["cancel"])}
          </ButtonV2>
          <ButtonV2
            disabled={!isAnyChanged || isAnySubmitting}
            isLoading={isAnySubmitting}
            onClick={handleSaveAll}
            icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
            iconPosition="end"
          >
            {translateButtons(["save"])}
          </ButtonV2>
        </Box>
      )}
    </div>
  );
};

export default PeopleConfigurations;
