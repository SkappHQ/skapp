import { Box } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useRef, useState } from "react";

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
import {
  BirthdayNotificationConfigPatchType,
  BirthdayNotificationConfigType
} from "~community/people/types/PeopleConfigTypes";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import GoogleWorkspaceSyncSettings from "~enterprise/configurations/components/organisms/GoogleWorkspaceSyncSettings/GoogleWorkspaceSyncSettings";
import type {
  GoogleWorkspaceSyncSettingsActions,
  GoogleWorkspaceSyncSettingsState
} from "~enterprise/configurations/components/organisms/GoogleWorkspaceSyncSettings/GoogleWorkspaceSyncSettings";

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

  const workspaceActionsRef = useRef<GoogleWorkspaceSyncSettingsActions>({
    save: () => {},
    reset: () => {}
  });
  const [workspaceState, setWorkspaceState] =
    useState<GoogleWorkspaceSyncSettingsState>({
      isDirty: false,
      isSubmitting: false
    });

  const [config, setConfig] = useState<BirthdayNotificationConfigType | null>(
    null
  );
  const [initialConfig, setInitialConfig] =
    useState<BirthdayNotificationConfigType | null>(null);

  const { data, isLoading, isError } = useGetBirthdayNotificationConfig();

  useEffect(() => {
    if (!data || config !== null) return;
    setConfig(data);
    setInitialConfig(data);
  }, [data, config]);

  const handleSuccess = (savedConfig: BirthdayNotificationConfigPatchType) => {
    setInitialConfig(savedConfig as BirthdayNotificationConfigType);
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

  const { mutate: updateConfig, isPending } =
    useUpdateBirthdayNotificationConfig(handleSuccess, handleError);

  const isFormChanged =
    !!config &&
    !!initialConfig &&
    (config.isTurnedOn !== initialConfig.isTurnedOn ||
      config.isTeamWide !== initialConfig.isTeamWide ||
      config.isOrganizationWide !== initialConfig.isOrganizationWide);

  const handleToggleChange = (
    key: keyof BirthdayNotificationConfigType,
    checked: boolean
  ) => {
    setConfig((previousConfig) =>
      previousConfig ? { ...previousConfig, [key]: checked } : previousConfig
    );
  };

  const handleCancel = () => setConfig(initialConfig);

  const handleSave = () => {
    if (!config || isPending) return;
    updateConfig(config);
  };

  const isBirthdaySectionLoaded = isError || (!isLoading && !!config);

  const isWorkspaceChanged = canManageGoogleWorkspace && workspaceState.isDirty;
  const isAnyChanged = isFormChanged || isWorkspaceChanged;
  const isAnySubmitting =
    isPending || (canManageGoogleWorkspace && workspaceState.isSubmitting);

  const handleCancelAll = () => {
    if (isFormChanged) handleCancel();
    if (isWorkspaceChanged) workspaceActionsRef.current.reset();
  };

  const handleSaveAll = () => {
    if (isFormChanged) handleSave();
    if (isWorkspaceChanged) workspaceActionsRef.current.save();
  };

  const subOptionsAriaMessage = config
    ? translateText([
        "aria",
        config.isTurnedOn ? "subOptionsAvailable" : "subOptionsUnavailable"
      ])
    : "";

  return (
    <div className="flex w-196 flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="subtitle2 text-black">
          {translateText(["title"])}
        </h2>
        <p className="body1 text-secondary-text">
          {translateText(["description"])}
        </p>
      </div>

      <div className="sr-only" role="status" aria-live="polite">
        {subOptionsAriaMessage}
      </div>

      {!isError && (isLoading || !config) && (
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

      {!isError && config && (
        <div className="flex flex-col gap-6">
          <SwitchRow
            label={translateText(["mainToggleLabel"])}
            labelId="birthday-notification"
            arialabel={translateText(["aria", "mainToggle"])}
            checked={config.isTurnedOn}
            onChange={(checked) => handleToggleChange("isTurnedOn", checked)}
          />
          {config.isTurnedOn && (
            <>
              <SwitchRow
                label={translateText(["teamToggleLabel"])}
                labelId="birthday-notification-team-only"
                arialabel={translateText(["aria", "teamToggle"])}
                tooltip={translateText(["teamToggleTooltip"])}
                checked={config.isTeamWide}
                onChange={(checked) => handleToggleChange("isTeamWide", checked)}
              />
              <SwitchRow
                label={translateText(["organizationToggleLabel"])}
                labelId="birthday-notification-entire-organization"
                arialabel={translateText(["aria", "organizationToggle"])}
                tooltip={translateText(["organizationToggleTooltip"])}
                checked={config.isOrganizationWide}
                onChange={(checked) =>
                  handleToggleChange("isOrganizationWide", checked)
                }
              />
            </>
          )}
        </div>
      )}

      {canManageGoogleWorkspace && (
        <>
          <hr className="w-full border-t border-secondary-accent" />

          <GoogleWorkspaceSyncSettings
            actionsRef={workspaceActionsRef}
            onStateChange={setWorkspaceState}
          />
        </>
      )}

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
