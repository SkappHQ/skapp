import { FormikProps } from "formik";
import { FocusEvent, useEffect, useRef } from "react";

export const useActivityAutoSave = <T extends object>(
  formik: FormikProps<T>,
  textFields: (keyof T)[]
): FormikProps<T> => {
  const { values, dirty, submitForm, handleBlur } = formik;

  const previousValues = useRef<T>(values);

  useEffect(() => {
    const changedFields = (Object.keys(values) as (keyof T)[]).filter(
      (field) => values[field] !== previousValues.current[field]
    );
    previousValues.current = values;

    if (dirty && changedFields.some((field) => !textFields.includes(field))) {
      submitForm();
    }
  }, [values]);

  const handleBlurAndSave = (event: FocusEvent<HTMLInputElement>): void => {
    handleBlur(event);
    if (dirty) submitForm();
  };

  return { ...formik, handleBlur: handleBlurAndSave } as FormikProps<T>;
};
