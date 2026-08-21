import { Dropdown, InputField } from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { FC, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import useStageNameMapper from "~community/crm/hooks/useStageNameMapper";
import StageLabel from "~community/crm/v2/components/atoms/StageLabel/StageLabel";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmDealEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { getOrderedStages } from "~community/crm/v2/utils/selectorUtils";

interface DealNameStageSectionProps {
  formik: FormikProps<CrmDealEntity>;
  isDuplicateName: boolean;
}

const DealNameStageSection: FC<DealNameStageSectionProps> = ({
  formik,
  isDuplicateName
}) => {
  const translateText = useTranslator("crmModule", "deals", "addDealSidePanel");
  const { getStageByName } = useStageNameMapper();

  let nameErrorMessage: string | undefined;
  if (isDuplicateName) {
    nameErrorMessage = translateText(["validations", "dealNameExists"]);
  } else if (formik.touched.name) {
    nameErrorMessage = formik.errors.name;
  }

  const { stagesRecord, preselectedStageId } = useCrmStoreV2(
    useShallow((store) => ({
      stagesRecord: store.stages,
      preselectedStageId: store.preselectedStageId
    }))
  );

  const stages = useMemo(() => getOrderedStages(stagesRecord), [stagesRecord]);
  const initialStageId = stages[0]?.id;

  let stageErrorMessage: string | undefined;
  if (formik.touched.stageId) {
    stageErrorMessage = formik.errors.stageId;
  }

  const stageDropdownVariant =
    formik.touched.stageId && formik.errors.stageId
      ? "primary-error"
      : "primary";

  useEffect(() => {
    if (preselectedStageId !== null) {
      formik.setFieldValue("stageId", preselectedStageId);
      return;
    }

    if (!formik.values.stageId && initialStageId !== undefined) {
      formik.setFieldValue("stageId", initialStageId);
    }
  }, [preselectedStageId, initialStageId]);

  const stageOptions = useMemo(
    () =>
      stages.map((stage) => ({
        id: String(stage.id),
        value: String(stage.id),
        label: (
          <StageLabel
            label={getStageByName(stage.name ?? "")}
            color={stage.color}
          />
        )
      })),
    [stages, getStageByName]
  );

  return (
    <div className="flex gap-6 items-start">
      <div className="w-2/3">
        <InputField
          label={translateText(["labels", "dealName"])}
          placeholder={translateText(["placeholders", "dealName"])}
          required
          name="name"
          value={formik.values.name ?? ""}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          state={nameErrorMessage ? "error" : "default"}
          errorMessage={nameErrorMessage}
          fullWidth
          aria-label={translateText(["ariaLabels", "dealName"])}
        />
      </div>
      <div className="w-1/3 pt-6.5">
        <Dropdown
          options={stageOptions}
          value={formik.values.stageId ? String(formik.values.stageId) : ""}
          onChange={(v) =>
            formik.setFieldValue("stageId", v ? Number(v) : undefined)
          }
          variant={stageDropdownVariant}
          className="rounded-lg"
          width="55%"
          placeholder={translateText(["placeholders", "stage"])}
          required
          errorMessage={stageErrorMessage}
          ariaLabel={translateText(["ariaLabels", "stage"])}
        />
      </div>
    </div>
  );
};

export default DealNameStageSection;
