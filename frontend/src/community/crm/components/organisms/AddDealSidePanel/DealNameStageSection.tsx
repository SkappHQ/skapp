import { Dropdown, InputField } from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { FC, useEffect } from "react";

import MultipleSkeletons from "~community/common/components/molecules/Skeletons/MultipleSkeletons";
import { useTranslator } from "~community/common/hooks/useTranslator";
import useGetStageOptions from "~community/crm/hooks/useGetStageOptions";
import { CrmDealAddFormTypes } from "~community/crm/types/CommonTypes";

interface DealNameStageSectionProps {
  formik: FormikProps<CrmDealAddFormTypes>;
}

const DealNameStageSection: FC<DealNameStageSectionProps> = ({ formik }) => {
  const translateText = useTranslator("crmModule", "deals", "addDealSidePanel");

  const {
    options: stageOptions = [],
    isLoading: isStagesLoading,
    isError: isStagesError,
    leadStageId
  } = useGetStageOptions();

  let stageErrorMessage: string | undefined;
  if (isStagesError) {
    stageErrorMessage = translateText(["validations", "stageLoadError"]);
  } else if (formik.touched.stageId) {
    stageErrorMessage = formik.errors.stageId;
  }

  const stageDropdownVariant =
    (formik.touched.stageId && formik.errors.stageId) || isStagesError
      ? "primary-error"
      : "primary";

  useEffect(() => {
    if (leadStageId !== undefined && !formik.values.stageId) {
      formik.setFieldValue("stageId", String(leadStageId));
    }
  }, [leadStageId, formik.values.stageId]);

  return (
    <div className="flex gap-6 items-start">
      <div className="w-2/3">
        <InputField
          label={translateText(["labels", "dealName"])}
          placeholder={translateText(["placeholders", "dealName"])}
          required
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          state={
            formik.touched.name && formik.errors.name ? "error" : "default"
          }
          errorMessage={formik.touched.name ? formik.errors.name : undefined}
          fullWidth
          aria-label={translateText(["ariaLabels", "dealName"])}
        />
      </div>
      <div className="w-1/3 pt-6.5">
        {isStagesLoading ? (
          <MultipleSkeletons numOfSkeletons={1} height={38} />
        ) : (
          <Dropdown
            options={stageOptions}
            value={formik.values.stageId}
            onChange={(v) => formik.setFieldValue("stageId", v)}
            variant={stageDropdownVariant}
            className="rounded-lg"
            width="55%"
            placeholder={translateText(["placeholders", "stage"])}
            required
            errorMessage={stageErrorMessage}
            ariaLabel={translateText(["ariaLabels", "stage"])}
          />
        )}
      </div>
    </div>
  );
};

export default DealNameStageSection;
