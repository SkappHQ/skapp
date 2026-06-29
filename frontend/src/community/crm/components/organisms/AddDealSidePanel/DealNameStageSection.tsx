import { Dropdown, InputField } from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { FC, useEffect, useMemo } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import SkeletonShape from "~community/crm/components/atoms/SkeletonShape/SkeletonShape";
import { STAGE_COLOR_MAP } from "~community/crm/constants/stageConstants";
import useGetMappedDealStages from "~community/crm/hooks/useGetMappedDealStages";
import { CrmDealAddFormTypes } from "~community/crm/types/CommonTypes";

interface DealNameStageSectionProps {
  formik: FormikProps<CrmDealAddFormTypes>;
}

const DealNameStageSection: FC<DealNameStageSectionProps> = ({ formik }) => {
  const translateText = useTranslator("crmModule", "deals", "addDealSidePanel");

  const {
    dealStages,
    initialStageId,
    isLoading: isStagesLoading,
    isError: isStagesError
  } = useGetMappedDealStages();

  const stageOptions = useMemo(
    () =>
      dealStages.map((s) => ({
        id: String(s.id),
        value: String(s.id),
        label: (
          <div className="inline-flex items-center gap-2.5">
            <div
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: STAGE_COLOR_MAP[s.color] }}
            />
            <span className="body2">{s.name}</span>
          </div>
        )
      })),
    [dealStages]
  );

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
    if (initialStageId !== undefined && !formik.values.stageId) {
      formik.setFieldValue("stageId", String(initialStageId));
    }
  }, [initialStageId, formik.values.stageId]);

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
          <SkeletonShape className="h-9 w-full" />
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
