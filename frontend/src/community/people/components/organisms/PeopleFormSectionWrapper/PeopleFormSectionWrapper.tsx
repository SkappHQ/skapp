import { Box, Divider, Stack, Typography } from "@mui/material";
import { Container, type SxProps } from "@mui/system";
import Head from "next/head";
import { JSX } from "react";

interface Props {
  title?: string;
  pageHead?: string;
  children: JSX.Element;
  dividerStyles?: SxProps;
  titleContainerStyles?: SxProps;
  showDivider?: boolean;
  containerStyles?: SxProps;
}
const PeopleFormSectionWrapper = ({
  title = "",
  pageHead: headerTitle = "",
  children,
  dividerStyles,
  titleContainerStyles,
  showDivider = true,
  containerStyles
}: Props): JSX.Element => {
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
        role="region"
        aria-label={title}
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
                <Typography variant="h2">{title}</Typography>
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

export default PeopleFormSectionWrapper;
