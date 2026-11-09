import { ButtonV2, PlusIcon } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { FC, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import ActivityDealField from "~community/crm/components/molecules/ActivityDealField/ActivityDealField";
import SidePanelDealSection from "~community/crm/components/molecules/SidePanelDealSection/SidePanelDealSection";
import { useActivityAutoSave } from "~community/crm/hooks/useActivityAutoSave";
import { CrmActivityDealFormValues } from "~community/crm/types/CrmCommonTypes";

interface Props {
  id: string;
  dealId: number | null;
  emptyDescription: string;
  onDealChange: (dealId: number | null) => void;
}

const SidePanelActivityDeal: FC<Props> = ({
  id,
  dealId,
  emptyDescription,
  onDealChange
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "activitySidePanel"
  );

  const [isAddingDeal, setIsAddingDeal] = useState(false);

  const formik = useFormik<CrmActivityDealFormValues>({
    initialValues: { dealId },
    enableReinitialize: true,
    onSubmit: (values) => {
      onDealChange(values.dealId);
      setIsAddingDeal(false);
    }
  });

  const autoSaveFormik = useActivityAutoSave(formik, []);

  if (dealId) {
    return (
      <div className="flex flex-col gap-2">
        <SidePanelDealSection
          dealIds={[dealId]}
          showAddDealAction={false}
          emptyHeightClassName="h-[163px]"
          emptyDescription={emptyDescription}
        />
        <div className="flex justify-end">
          <ButtonV2
            variant="tertiary"
            size="sm"
            aria-label={translateAria(["removeDeal"])}
            onClick={() => onDealChange(null)}
          >
            {translateText([
              "activities",
              "activitySidePanel",
              "buttons",
              "removeDeal"
            ])}
          </ButtonV2>
        </div>
      </div>
    );
  }

  if (isAddingDeal) {
    return (
      <ActivityDealField
        id={`${id}-deal`}
        formik={autoSaveFormik}
        fieldAriaLabel={translateAria(["dealSearch"])}
      />
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <p className="body2">{emptyDescription}</p>
      <ButtonV2
        variant="line"
        size="sm"
        icon={<PlusIcon />}
        iconPosition="end"
        aria-label={translateAria(["addDeal"])}
        onClick={() => setIsAddingDeal(true)}
      >
        {translateText(["deals", "common", "buttons", "addDeal"])}
      </ButtonV2>
    </div>
  );
};

export default SidePanelActivityDeal;
