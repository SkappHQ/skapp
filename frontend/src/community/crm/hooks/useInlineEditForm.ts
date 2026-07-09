import { useFormik } from "formik";
import { useState } from "react";

interface UseInlineEditFormParams {
  value: string;
  validate?: (value: string) => string;
  onSave: (value: string) => void;
}

const useInlineEditForm = ({
  value,
  validate,
  onSave
}: UseInlineEditFormParams) => {
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

  const startEditing = () => {
    resetForm();
    setIsEditing(true);
  };

  const changeValue = (nextValue: string) => {
    setFieldValue("value", nextValue, true);
  };

  const save = async (): Promise<boolean> => {
    const validationErrors = await validateForm();
    if (validationErrors.value) {
      return false;
    }
    await submitForm();
    setIsEditing(false);
    return true;
  };

  const discard = () => {
    resetForm();
    setIsEditing(false);
  };

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

export default useInlineEditForm;
