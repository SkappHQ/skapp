const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface EditContactFormValues {
  name: string;
  email: string;
  contactNumber: string;
}

type TranslateFn = (keys: string[]) => string;

/**
 * Formik-compatible validator for the Edit Contact form.
 * Returns field-level error messages using the provided translateText function.
 */
export const validateEditContactForm = (
  values: EditContactFormValues,
  translateText: TranslateFn
): Partial<EditContactFormValues> => {
  const errors: Partial<EditContactFormValues> = {};

  if (!values.name.trim()) {
    errors.name = translateText(["editContactModal", "nameRequired"]);
  }

  if (!values.email.trim()) {
    errors.email = translateText(["editContactModal", "emailRequired"]);
  } else if (!EMAIL_REGEX.test(values.email)) {
    errors.email = translateText(["editContactModal", "emailInvalid"]);
  }

  return errors;
};
