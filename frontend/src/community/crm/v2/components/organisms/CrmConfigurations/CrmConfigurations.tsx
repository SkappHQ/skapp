import { Dropdown, InfoIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { appModes } from "~community/common/constants/configs";
import { useTranslator } from "~community/common/hooks/useTranslator";
import DealStagesSection from "~community/crm/v2/components/organisms/DealStagesSection/DealStagesSection";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import CrmCurrencyPreferences from "~enterprise/configurations/components/organisms/CrmCurrencyPreferences/CrmCurrencyPreferences";
import CrmLimitModalController from "~enterprise/crm/components/organisms/CrmLimitModalController/CrmLimitModalController";

const CrmConfigurations: FC = () => {
  const translateText = useTranslator("configurations", "crm");

  const isEnterprise = useGetEnvironment() === appModes.ENTERPRISE;

  const currencyOptions = [
    {
      id: "usd",
      label: translateText(["currencySection", "currencyOptions", "usd"]),
      value: "USD"
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-[49rem]">
      {isEnterprise ? (
        <CrmCurrencyPreferences />
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="subtitle2">
              {translateText(["currencySection", "currencyPreferencesTitle"])}
            </h2>
            <p className="body1 text-secondary-text mt-4">
              {translateText([
                "currencySection",
                "currencyPreferencesDescription"
              ])}
            </p>
          </div>
          <div className="flex flex-row items-center gap-3">
            <Dropdown
              options={currencyOptions}
              value="USD"
              variant="primary-disabled"
              ariaLabel={translateText([
                "currencySection",
                "ariaLabel",
                "selectCurrency"
              ])}
              width="100%"
            />

            <div className="flex flex-row items-center gap-2">
              <InfoIcon width={32} height={32} />
              <p className="body2">
                {translateText(["currencySection", "currencyInfoNote"])}
              </p>
            </div>
          </div>
        </div>
      )}
      <hr className="w-full border-t border-secondary-accent" />

      <DealStagesSection />

      <CrmLimitModalController />
    </div>
  );
};

export default CrmConfigurations;
