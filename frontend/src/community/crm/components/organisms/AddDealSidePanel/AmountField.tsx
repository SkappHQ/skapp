import { InputField } from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmDealAddFormTypes } from "~community/crm/types/CommonTypes";

interface AmountFieldProps {
  formik: FormikProps<CrmDealAddFormTypes>;
}

const AmountField: FC<AmountFieldProps> = ({ formik }) => {
  const translateText = useTranslator("crmModule", "deals", "addDealSidePanel");
  const { values, errors, touched, handleChange, handleBlur } = formik;

  return (
    <InputField
      name="amount"
      value={values.amount}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={translateText(["placeholders", "none"])}
      type="text"
      variant="sm"
      fullWidth
      state={touched.amount && errors.amount ? "error" : "default"}
      errorMessage={touched.amount ? errors.amount : undefined}
      aria-label={translateText(["ariaLabels", "amount"])}
      customStyles={{ background: "bg-white", border: "border-0" }}
    />
  );
};

export default AmountField;
