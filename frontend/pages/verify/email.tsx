import { Typography } from "@mui/material";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import React from "react";

import VerifyAccount from "~enterprise/common/components/organisms/VerifyAccount/VerifyAccount";
import { MultiStepSignUpLayout } from "~enterprise/common/components/templates/MultiStepSignUpLayout/MultiStepSignUpLayout";

const VerifyEmailPage: NextPage = () => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;

  const Paragraph = () => (
    <Typography
      variant="body2"
      sx={{ textAlign: "center", mb: 2 }}
      role="complementary"

      // aria-label={translateAria(["signInLinkSection"])}
    >
      We’ve sent a 4-digit code to <strong>{userEmail}</strong>. The code will
      expire soon — please enter it to continue.
    </Typography>
  );
  return (
    <MultiStepSignUpLayout
      currentStep={1}
      title="Verify your account"
      description={<Paragraph />}
      showSteps={true}
      showSignInLink={{ visible: false, position: "top" }}
      containerWidth={{ xs: "100%", sm: "421px" }}
    >
      <VerifyAccount />
    </MultiStepSignUpLayout>
  );
};

export default VerifyEmailPage;
