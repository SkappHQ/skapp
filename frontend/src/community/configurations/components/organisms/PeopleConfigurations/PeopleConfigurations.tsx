import { ButtonV2, CloseIcon, SaveIcon } from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useState } from "react";

import SwitchRow from "~community/common/components/atoms/SwitchRow/SwitchRow";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  useGetBirthdayNotificationConfig,
  useUpdateBirthdayNotificationConfig
} from "~community/people/api/PeopleApi";
import {
  BirthdayNotificationConfigPatchType,
  BirthdayNotificationConfigType
} from "~community/people/types/PeopleConfigTypes";

const PeopleConfigurations: FC = () => {
  const translateText = useTranslator(
    "configurations",
    "people",
    "birthdayNotificationSection"
  );
  const translateButton = useTranslator("configurations", "people", "buttons");
  const { setToastMessage } = useToast();

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
        <>
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
                  onChange={(checked) =>
                    handleToggleChange("isTeamWide", checked)
                  }
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

          <div className="flex flex-row gap-4">
            <ButtonV2
              variant="tertiary"
              size="md"
              icon={<CloseIcon />}
              iconPosition="end"
              disabled={!isFormChanged}
              onClick={handleCancel}
            >
              {translateButton(["cancel"])}
            </ButtonV2>
            <ButtonV2
              variant="primary"
              size="md"
              icon={<SaveIcon />}
              iconPosition="end"
              disabled={!isFormChanged || isPending}
              onClick={handleSave}
            >
              {translateButton(["save"])}
            </ButtonV2>
          </div>
        </>
      )}
    </div>
  );
};

export default PeopleConfigurations;
