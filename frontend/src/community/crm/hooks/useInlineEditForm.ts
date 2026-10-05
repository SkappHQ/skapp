import { useFormik } from "formik";
import { useCallback, useState } from "react";

interface UseInlineEditFormParams {
  value: string;
  validate?: (value: string) => string;
  onSave: (value: string) => void;
}

export interface UseInlineEditFormReturn {
  isEditing: boolean;
  value: string;
  error?: string;
  startEditing: () => void;
  changeValue: (nextValue: string) => void;
  save: () => Promise<boolean>;
  discard: () => void;
}

export const useInlineEditForm = ({
  value,
  validate,
  onSave
}: UseInlineEditFormParams): UseInlineEditFormReturn => {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const formik = useFormik<{ value: string }>({
    initialValues: { value },
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    validate: (formValues) => {
      const error = validate?.(formValues.value);
      return error ? { value: error } : {};
    },
    onSubmit: (formValues) => {
      const nextValue = formValues.value.trim();
      if (nextValue !== value.trim()) {
        onSave(nextValue);
      }
    }
  });

  const { values, errors, setFieldValue, validateForm, submitForm, resetForm } =
    formik;

  const startEditing = useCallback(() => {
    resetForm();
    setIsEditing(true);
  }, [resetForm]);

  const changeValue = useCallback(
    (nextValue: string) => {
      setFieldValue("value", nextValue, true);
    },
    [setFieldValue]
  );

  const save = useCallback(async (): Promise<boolean> => {
    const validationErrors = await validateForm();
    if (validationErrors.value) {
      return false;
    }
    await submitForm();
    setIsEditing(false);
    return true;
  }, [validateForm, submitForm]);

  const discard = useCallback(() => {
    resetForm();
    setIsEditing(false);
  }, [resetForm]);

  return {
    isEditing,
    value: values.value,
    error: errors.value,
    startEditing,
    changeValue,
    save,
    discard
  };
};
