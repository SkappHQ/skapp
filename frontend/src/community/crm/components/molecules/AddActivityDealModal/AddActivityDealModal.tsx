import { CloseIcon, SmallModal } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import ActivityDealField from "~community/crm/components/molecules/ActivityDealField/ActivityDealField";
import { CrmActivityDealFormValues } from "~community/crm/types/CrmCommonTypes";

interface Props {
  id: string;
  filterCompanyId?: number;
  onSave: (dealId: number | null) => void;
  onClose: () => void;
}

const AddActivityDealModal: FC<Props> = ({
  id,
  filterCompanyId,
  onSave,
  onClose
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "activitySidePanel"
  );

  const formik = useFormik<CrmActivityDealFormValues>({
    initialValues: { dealId: null },
    onSubmit: (values) => onSave(values.dealId)
  });

  const { values, submitForm } = formik;

  return (
    <SmallModal
      isOpen
      onClose={onClose}
      modalHeader={translateText(["deals", "common", "buttons", "addDeal"])}
      content={
        <ActivityDealField
          id={`${id}-add-deal`}
          formik={formik}
          fieldAriaLabel={translateAria(["dealSearch"])}
          {...(filterCompanyId && { filterCompanyId })}
        />
      }
      buttons={{
        buttonLeft: {
          variant: "tertiary",
          children: translateText([
            "activities",
            "logActivity",
            "buttons",
            "cancel"
          ]),
          icon: <CloseIcon />,
          iconPosition: "end",
          onClick: onClose
        },
        buttonRight: {
          variant: "primary",
          children: translateText([
            "activities",
            "activitySidePanel",
            "buttons",
            "save"
          ]),
          disabled: !values.dealId,
          onClick: submitForm
        }
      }}
    />
  );
};

export default AddActivityDealModal;
