import {
  IconButton,
  Stack,
  SxProps,
  Theme,
  Typography,
  useTheme
} from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { JSX, ReactNode, useMemo } from "react";

import { useGetOrganization } from "~community/common/api/OrganizationCreateApi";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { themeSelector } from "~community/common/theme/themeSelector";
import { ThemeTypes } from "~community/common/types/AvailableThemeColors";
import { IconName } from "~community/common/types/IconTypes";
import { mergeSx } from "~community/common/utils/commonUtil";

import Icon from "../../atoms/Icon/Icon";
import styles from "./styles";

interface Props {
  pageHead: string;
  icon?: {
    name?: IconName;
    dataTestId?: string;
    onClick?: () => void | Promise<void>;
    styles?: SxProps;
    ariaLabel?: string;
    title?: string;
  };
  title: string;
  stepText: string;
  customStyles?: {
    wrapper?: SxProps;
    container?: SxProps;
    header?: SxProps;
    title?: SxProps;
    stepText?: SxProps;
    body?: SxProps;
  };
  children?: ReactNode;
  id?: string;
  tabIndex?: number;
}

const FullPageContainerLayout = ({
  pageHead,
  icon,
  title,
  stepText,
  customStyles,
  children,
  id,
  tabIndex
}: Props): JSX.Element => {
  const router = useRouter();

  const theme: Theme = useTheme();

  const translateAria = useTranslator("commonAria", "components");

  const { data: organizationDetails } = useGetOrganization();

  const updatedTheme = useMemo(() => {
    return themeSelector(
      organizationDetails?.results?.[0]?.themeColor || ThemeTypes.BLUE_THEME
    );
  }, [organizationDetails]);

  theme.palette = updatedTheme.palette;

  const classes = styles(theme);

  const onIconClick = () => {
    if (icon?.onClick) {
      icon.onClick();
    } else {
      router.back();
    }
  };
  return (
    <>
      <Head>
        <title>{pageHead}</title>
      </Head>
      <Stack
        component="div"
        sx={mergeSx([classes.wrapper, customStyles?.wrapper])}
        id={id}
        tabIndex={tabIndex}
      >
        <Stack
          component="div"
          sx={mergeSx([classes.container, customStyles?.container])}
        >
          <Stack
            component="div"
            sx={mergeSx([classes.header, customStyles?.header])}
            role="banner"
          >
            <IconButton
              tabIndex={0}
              data-testid={icon?.dataTestId}
              aria-label={icon?.ariaLabel ?? translateAria(["backButton"])}
              title={icon?.title ?? translateAria(["backButton"])}
              onClick={onIconClick}
              sx={classes.iconBtn}
            >
              <Icon name={icon?.name ?? IconName.CLOSE_ICON} />
            </IconButton>
            <Stack
              component="div"
              sx={mergeSx([classes.title, customStyles?.title])}
            >
              <Typography variant="h1">{title}</Typography>
              <Typography
                variant="body2"
                sx={mergeSx([classes.stepText, customStyles?.stepText])}
              >
                {stepText}
              </Typography>
            </Stack>
          </Stack>
          <Stack component="main" sx={mergeSx([customStyles?.body])}>
            {children}
          </Stack>
        </Stack>
      </Stack>
    </>
  );
};

export default FullPageContainerLayout;
