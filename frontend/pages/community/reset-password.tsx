import { Box } from "@mui/material";
import { FormikHelpers, useFormik } from "formik";
import { NextPage } from "next";
import { signIn, useAuth } from "~community/common/context/AuthContext";

import { useResetPassword } from "~community/common/api/ResetPasswordApi";
import ResetPasswordForm from "~community/common/components/organisms/Forms/ResetPassword/ResetPasswordForm";
import OnboardingLayout from "~community/common/components/templates/OnboardingLayout/OnboardingLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { passwordValidationSchema } from "~community/common/utils/validation";

interface FormValues {
  password: string;
  confirmPassword: string;
}

const ResetPassword: NextPage = () => {
  const translateText = useTranslator("onboarding", "resetPassword");

  const { setToastMessage } = useToast();

  const { data: session } = useAuth();

  const initialValues: FormValues = {
    password: "",
    confirmPassword: ""
  };

  const onSuccess = async () => {
    setToastMessage({
      open: true,
      toastType: "success",
      title: translateText(["passwordChangeSuccessTitle"]),
      description: translateText(["passwordChangeSuccessDescription"]),
      isIcon: true
    });

    await signIn("credentials", {
      redirect: false,
      email: session?.user?.email as string,
      password: values.password
    });
    // This is a temporary fix for the issue, need to implement a better solution later
    window.location.reload();
  };

  const onError = () => {
    setToastMessage({
      open: true,
      toastType: "error",
      title: translateText(["passwordChangeFailedTitle"]),
      description: translateText(["passwordChangeFailedDescription"]),
      isIcon: true
    });
  };

  const resetPasswordMutation = useResetPassword(onSuccess, onError);

  const onSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    if (values.password !== values.confirmPassword) {
      setToastMessage({
        open: true,
        toastType: "error",
        title: translateText(["passwordChangeFailedTitle"]),
        description: translateText(["passwordChangeFailedDescription"]),
        isIcon: true
      });
      setSubmitting(false);
      return;
    }

    resetPasswordMutation.mutate({
      newPassword: values.password
    });

    setSubmitting(false);
  };

  const formik = useFormik({
    initialValues,
    validationSchema: passwordValidationSchema(translateText),
    onSubmit,
    validateOnChange: true,
    validateOnBlur: true
  });

  const { values, errors, touched, handleChange, handleBlur, isSubmitting } =
    formik;

  const handleSubmit = () => {
    if (errors.password) {
      setToastMessage({
        open: true,
        toastType: "error",
        title: translateText(["passwordIsNotValidTitle"]),
        description: translateText(["passwordIsNotValidDescription"]),
        isIcon: true
      });
      return;
    }

    formik.handleSubmit();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center"
      }}
    >
      <OnboardingLayout
        heading={translateText(["pageHeading"])}
        subheading={translateText(["pageSubHeading"])}
        onClick={handleSubmit}
        disabled={isSubmitting}
        buttonText={translateText(["resetBtnText"])}
        centerHeading={true}
      >
        <ResetPasswordForm
          handleChange={handleChange}
          handleBlur={handleBlur}
          values={values}
          errors={errors}
          touched={touched}
        />
      </OnboardingLayout>
    </Box>
  );
};

export default ResetPassword;
