import { Dropdown, InputField } from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { FC } from "react";

import MultipleSkeletons from "~community/common/components/molecules/Skeletons/MultipleSkeletons";
import { CrmDealAddFormTypes } from "~community/crm/types/CommonTypes";

interface DealNameStageSectionProps {
  translateText: (keys: string[]) => string;
  formik: FormikProps<CrmDealAddFormTypes>;
  isStagesLoading: boolean;
  stageOptions: { id: string; value: string; label: React.ReactNode }[];
  stageErrorMessage: string | undefined;
  stageDropdownVariant: "primary" | "primary-error";
}

const DealNameStageSection: FC<DealNameStageSectionProps> = ({
  translateText,
  formik,
  isStagesLoading,
  stageOptions,
  stageErrorMessage,
  stageDropdownVariant
}) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    formik;

  return (
    <div className="flex gap-6 items-start">
      <div className="w-2/3">
        <InputField
          label={translateText(["labels", "dealName"])}
          placeholder={translateText(["placeholders", "dealName"])}
          required
          name="name"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          state={touched.name && errors.name ? "error" : "default"}
          errorMessage={touched.name ? errors.name : undefined}
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
            value={values.stageId}
            onChange={(v) => setFieldValue("stageId", v)}
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
