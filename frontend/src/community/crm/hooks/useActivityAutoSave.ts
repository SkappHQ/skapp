import { FormikProps } from "formik";
import { useEffect } from "react";

import useDebounce from "~community/common/hooks/useDebounce";
import { AUTO_SAVE_DEBOUNCE_DELAY } from "~community/crm/constants/commonConstants";

export const useActivityAutoSave = <T extends object>(
  formik: FormikProps<T>
): void => {
  const { values, dirty, submitForm } = formik;

  const debouncedValues = useDebounce(values, AUTO_SAVE_DEBOUNCE_DELAY);

  useEffect(() => {
    if (dirty) submitForm();
  }, [debouncedValues]);
};
