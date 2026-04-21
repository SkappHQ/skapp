import { Box, Divider, Stack, Typography } from "@mui/material";
import { Container, type SxProps } from "@mui/system";
import Head from "next/head";
import { useRouter } from "next/router";
import { JSX, memo } from "react";

import BackIcon from "~community/common/assets/Icons/BackIcon";

interface Props {
  title?: string;
  pageHead?: string;
  children: JSX.Element;
  isInInnerPage?: boolean;
  dividerStyles?: SxProps;
  onBackClick?: () => void;
  innerPageBackButtonStyles?: SxProps;
  isButtonVisible?: boolean;
  buttonText?: string;
  buttonStyles?: SxProps;
  buttonEndIcon?: JSX.Element;
  buttonStartIcon?: JSX.Element;
  onButtonClick?: () => void;
  showBackButton?: boolean;
  titleContainerStyles?: SxProps;
  showDivider?: boolean;
  containerStyles?: SxProps;
  titleStyles?: SxProps;
  type?:
    | "outline"
    | "disabled"
    | "white"
    | "tertiary"
    | "primary"
    | "secondary"
    | "error";
  actionElement?: JSX.Element;
}

const PeopleLayout = ({
  title = "",
  pageHead: headerTitle = "",
  children,
  isInInnerPage = false,
  onBackClick,
  dividerStyles,
  innerPageBackButtonStyles,
  showBackButton = false,
  titleContainerStyles,
  showDivider = true,
  containerStyles
}: Props): JSX.Element => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{headerTitle}</title>
      </Head>
      <Container
        disableGutters
        maxWidth={false}
        sx={{
          padding: {
            xs: "0rem 2rem 1.875rem 2rem",
            lg: "1.125rem 3rem 1.875rem 3rem"
          },
          maxWidth: "103.125rem",
          width: "100%",
          height: "auto",
          overflowY: "auto",
          margin: "0rem auto",
          ...containerStyles
        }}
      >
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "space-between",
              justifyContent: "center",
              flexDirection: "column",
              ...titleContainerStyles
            }}
          >
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
            >
              <Stack
                flexDirection="row"
                justifyContent="flex-start"
                alignItems="center"
                width="100%"
                gap={3}
              >
                {(isInInnerPage || showBackButton) && (
                  <Box
                    sx={{
                      display: "flex",
                      my: "auto",
                      width: "auto",
                      height: "auto",
                      cursor: "pointer",
                      ...innerPageBackButtonStyles
                    }}
                    onClick={
                      onBackClick ||
                      (() => {
                        router.back();
                      })
                    }
                  >
                    <BackIcon />
                  </Box>
                )}

                {title && <Typography variant="h2">{title}</Typography>}
              </Stack>
            </Stack>
          </Box>

          {showDivider && <Divider sx={{ my: "1.5rem", ...dividerStyles }} />}

          {children}
        </Box>
      </Container>
    </>
  );
};

export default memo(PeopleLayout);
