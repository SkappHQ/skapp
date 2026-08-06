import { FormikProps } from "formik";
import { ChangeEvent } from "react";

interface UsePhoneNumberFieldHandlersParams<T> {
  formik: FormikProps<T>;
  countryCodeField: keyof T;
}

const usePhoneNumberFieldHandlers = <T>({
  formik,
  countryCodeField
}: UsePhoneNumberFieldHandlersParams<T>) => {
  const { setFieldValue, handleChange } = formik;

  const handleChangeCountry = async (code: string) => {
    await setFieldValue(countryCodeField as string, code);
  };

  const handleChangeContactNumber = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    handleChange(e);
  };

  return { handleChangeCountry, handleChangeContactNumber };
};

export default usePhoneNumberFieldHandlers;
