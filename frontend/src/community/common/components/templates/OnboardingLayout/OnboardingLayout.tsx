import { Box, SxProps, Theme, Typography } from "@mui/material";
import Head from "next/head";
import Image from "next/image";
import React, { CSSProperties } from "react";

import { buttonTestId } from "~community/common/constants/testIds";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { mergeSx } from "~community/common/utils/commonUtil";
import logo from "~public/logo/logo.png";

import { Button } from "@rootcodelabs/skapp-ui";
import Icon from "../../atoms/Icon/Icon";
import { styles } from "./styles";

type LayoutProps = {
  heading: string;
  subheading?: string;
  children: React.ReactNode;
  subheadingStyle?: SxProps<Theme>;
  disabled?: boolean;
  onClick: () => void;
  buttonText?: string;
  centerHeading?: boolean;
  isLoading?: boolean;
};

const OnboardingLayout: React.FC<LayoutProps> = ({
  heading,
  subheading,
  subheadingStyle,
  children,
  disabled = false,
  onClick,
  buttonText,
  centerHeading = false,
  isLoading = false
}) => {
  const classes = styles();

  const translateText = useTranslator("onboarding", "organizationCreate");
  const submitButtonText = buttonText || translateText(["continueBtnText"]);

  return (
    <Box sx={classes.container}>
      <Head>
        <title>Skapp</title>
      </Head>
      <Image
        src={logo}
        height={77}
        width={208}
        alt="logo"
        style={classes.logo as CSSProperties}
      />
      <Box sx={classes.headerContainer}>
        <Typography
          variant="onboardingHeader"
          component="h1"
          sx={{
            ...classes.header,
            textAlign: centerHeading ? "center" : "left"
          }}
        >
          {heading}
        </Typography>
        {subheading && (
          <Typography
            variant="body1"
            sx={mergeSx([classes.subHeader, subheadingStyle])}
          >
            {subheading}
          </Typography>
        )}
      </Box>
      {children}
      <Button variant={"primary"} fullWidth={false} onClick={onClick} disabled={disabled} isLoading={isLoading} data-testid={buttonTestId.onboardingLayoutSubmitBtn} title={submitButtonText} icon={<Icon name={IconName.RIGHT_ARROW_ICON} />} iconPosition="end">{submitButtonText}</Button>
    </Box>
  );
};

export default OnboardingLayout;
