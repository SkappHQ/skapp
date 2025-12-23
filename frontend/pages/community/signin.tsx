import { Box, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { FormikHelpers, useFormik } from "formik";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";

import { useGetApplicationVersionDetails } from "~community/common/api/VersionUpgradeApi";
import { organizationCreateEndpoints } from "~community/common/api/utils/ApiEndpoints";
import { useAuth } from "~community/common/auth/AuthProvider";
import RequestPasswordChangeModal from "~community/common/components/molecules/RequestPasswordChangeModal/RequestPasswordChangeModal";
import SignInForm from "~community/common/components/organisms/Forms/SignInForm/SignInForm";
import OnboardingLayout from "~community/common/components/templates/OnboardingLayout/OnboardingLayout";
import ROUTES from "~community/common/constants/routes";
import { AppVersionNotificationType } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useWebSocket } from "~community/common/providers/WebSocketProvider";
import { base64Pattern } from "~community/common/regex/regexPatterns";
import { useVersionUpgradeStore } from "~community/common/stores/versionUpgradeStore";
import authFetch from "~community/common/utils/axiosInterceptor";
import { decodeBase64 } from "~community/common/utils/commonUtil";
import { getCurrentWeekNumber } from "~community/common/utils/dateTimeUtils";
import { useRedirectHandler } from "~community/common/utils/hooks/useRedirectHandler";
import { signInValidation } from "~community/common/utils/validation";
import { AuthMethods, SignInStatus } from "~enterprise/auth/utils/authUtils";
import i18n from "~i18n";

import { version } from "../../package.json";

interface SignInValues {
  email: string;
  password: string;
}

const SignIn: NextPage = () => {
  const router = useRouter();

  const { signIn, user } = useAuth();

  const { setToastMessage } = useToast();

  const { error } = useWebSocket();

  useRedirectHandler({ isSignInPage: true });

  const getLanguage = () => i18n.language;

  const translateText = useTranslator("onboarding", "signIn");

  const theme: Theme = useTheme();

  const {
    setIsDailyNotifyDisplayed,
    setShowInfoBanner,
    setIsWeeklyNotifyDisplayed,
    setShowInfoModal,
    setVersionUpgradeInfo,
    setCurrentWeek,
    currentWeek
  } = useVersionUpgradeStore((state) => state);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    event.preventDefault();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const initialValues: SignInValues = {
    email: "",
    password: ""
  };

  const handleRedirect = useCallback(async () => {
    const data = await authFetch.get(
      organizationCreateEndpoints.CHECK_ORG_SETUP_STATUS
    );

    const orgSetupStatus = data?.data?.results[0]?.isOrganizationSetupCompleted;

    const isPasswordChanged = user?.isPasswordChangedForTheFirstTime;
    if (isPasswordChanged === false) {
      router.push(ROUTES.AUTH.RESET_PASSWORD);
    } else {
      if (!orgSetupStatus) {
        router.push(ROUTES.ORGANIZATION.SETUP);
      } else {
        router.push(ROUTES.DASHBOARD.BASE);
      }
    }
  }, [router, user]);

  const handleSubmit = async (
    values: SignInValues,
    { setSubmitting }: FormikHelpers<SignInValues>
  ) => {
    try {
      let password = values.password;

      if (
        base64Pattern().test(password) &&
        !user?.isPasswordChangedForTheFirstTime
      ) {
        password = decodeBase64(password);
      }

      const result = await signIn({
        email: values.email,
        password,
        method: AuthMethods.CREDENTIAL
      });

      if (result !== SignInStatus.SUCCESS) {
        setToastMessage({
          open: true,
          toastType: "error",
          title: translateText(["loginFailedTitle"]),
          description: translateText(["loginFailedDescription"]),
          isIcon: true
        });
      } else {
        handleRedirect();
      }
    } catch (error) {
      setToastMessage({
        open: true,
        toastType: "error",
        title: translateText(["loginFailedTitle"]),
        description: translateText(["loginFailedDescription"]),
        isIcon: true
      });
    } finally {
      setSubmitting(false);
    }
  };

  const signInFormik = useFormik({
    initialValues,
    validationSchema: signInValidation(translateText),
    onSubmit: handleSubmit,
    validateOnChange: false
  });

  const handleInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target) {
        signInFormik.setFieldError(event.target.name, "");
      }
    },
    [signInFormik]
  );

  useEffect(() => {
    if (error) {
      setToastMessage({
        open: true,
        toastType: "error",
        title: error.title,
        description: error.description,
        isIcon: true
      });
    }
  }, [error, setToastMessage]);

  const { data, isLoading } = useGetApplicationVersionDetails(getLanguage());

  useEffect(() => {
    if (data && !isLoading && version < data?.versionNo) {
      if (
        data?.type === AppVersionNotificationType.INFO &&
        getCurrentWeekNumber() !== currentWeek
      ) {
        setShowInfoModal(true);
        setIsWeeklyNotifyDisplayed(false);
        setCurrentWeek(getCurrentWeekNumber());
      }

      setShowInfoBanner(true);
      setIsDailyNotifyDisplayed(false);
      setVersionUpgradeInfo({
        bannerDescription: data?.bannerDescription,
        buttonText: data?.buttonText,
        popupDescription: data?.popupDescription,
        popupTitle: data?.popupTitle,
        type: data?.type,
        redirectUrl: data?.redirectUrl
      });
    }
  }, [data, isLoading]);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        gap: "0.5rem"
      }}
    >
      <OnboardingLayout
        heading={translateText(["pageHeading"])}
        subheading={translateText(["pageSubHeading"])}
        onClick={signInFormik.handleSubmit}
        disabled={signInFormik.isSubmitting}
        buttonText={translateText(["loginBtnText"])}
        centerHeading={true}
      >
        <SignInForm
          handleChange={signInFormik.handleChange}
          handleInput={handleInput}
          values={signInFormik.values}
          errors={signInFormik.errors}
        />
      </OnboardingLayout>
      <Box
        sx={{
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Typography
          variant="body1"
          component="span"
          sx={{ mr: 1, fontSize: "1rem" }}
        >
          {translateText(["forgotPasswordText"])}
        </Typography>
        <Typography
          variant="body1"
          component="span"
          sx={{
            textDecoration: "underline",
            color: theme.palette.primary.dark,
            fontSize: "1rem"
          }}
        >
          <Link href="#" onClick={handleOpenModal}>
            {translateText(["resetPasswordLinkText"])}
          </Link>
          <RequestPasswordChangeModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        </Typography>
      </Box>
    </Box>
  );
};

export default SignIn;
