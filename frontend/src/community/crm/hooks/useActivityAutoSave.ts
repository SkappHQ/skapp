import { FormikProps } from "formik";
import { useEffect } from "react";

export const useActivityAutoSave = <T extends object>(
  formik: FormikProps<T>
): void => {
  const { values, dirty, submitForm } = formik;

  useEffect(() => {
    if (dirty) submitForm();
  }, [values]);
};
