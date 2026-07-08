import { useFormik } from "formik";
import { useState } from "react";

interface UseInlineEditFormParams {
  value: string;
  validate?: (value: string) => string;
  onSave?: (value: string) => void;
  onChange?: (value: string) => void;
}

const useInlineEditForm = ({
  value,
  validate,
  onSave,
  onChange
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
        (onSave ?? onChange)?.(nextValue);
      }
    }
  });

  const { values, errors, setFieldValue, setErrors, validateForm, submitForm } =
    formik;

  const activateEditing = () => {
    setIsEditing(true);
    setFieldValue("value", value);
    setErrors({});
  };

  const changeValue = (nextValue: string) => {
    setFieldValue("value", nextValue);
    if (validate) {
      const error = validate(nextValue);
      setErrors(error ? { value: error } : {});
    }
    onChange?.(nextValue);
  };

  const save = async (): Promise<boolean> => {
    const validationErrors = await validateForm();
    if (validationErrors.value) {
      setErrors(validationErrors);
      return false;
    }
    await submitForm();
    setIsEditing(false);
    return true;
  };

  const discard = () => {
    setFieldValue("value", value);
    setErrors({});
    setIsEditing(false);
  };

  return {
    isEditing,
    value: values.value,
    error: errors.value,
    activateEditing,
    changeValue,
    save,
    discard
  };
};

export default useInlineEditForm;
