import { Stack, SxProps, Theme, Typography, useTheme } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";
import { mergeSx } from "~community/common/utils/commonUtil";

import styles from "./styles";

export interface TableEmptyScreenProps {
  title?: string;
  description?: string;
  button?: {
    id?: string;
    shouldBlink?: boolean;
    label?: string;
    startIcon?: IconName;
    endIcon?: IconName;
    onClick?: () => void;
    styles?: SxProps<Theme>;
  };
  customStyles?: {
    wrapper?: SxProps<Theme>;
    container?: SxProps<Theme>;
    title?: SxProps<Theme>;
    description?: SxProps<Theme>;
  };
}

const TableEmptyScreen: FC<TableEmptyScreenProps> = ({
  title,
  description,
  button = {},
  customStyles
}) => {
  const theme: Theme = useTheme();

  const classes = styles(theme);

  const descriptionId = `table-empty-desc-${crypto.randomUUID()}`;

  return (
    <Stack sx={mergeSx([classes.wrapper, customStyles?.wrapper])}>
      <Stack
        component="div"
        sx={mergeSx([classes.container, customStyles?.container])}
      >
        <Icon name={IconName.MAGNIFYING_GLASS_ICON} />

        {title && (
          <Typography sx={mergeSx([classes.title, customStyles?.title])}>
            {title}
          </Typography>
        )}

        <Typography
          id={descriptionId}
          component="div"
          variant="body2"
          sx={mergeSx([classes.description, customStyles?.description])}
        >
          {description}
        </Typography>

        {button?.label && (
          <ButtonV2
            id={button?.id}
            variant="primary"
            fullWidth={false}
            onClick={button?.onClick}
            aria-describedby={descriptionId}
            className={button?.shouldBlink ? "animate-pulse" : ""}
            icon={
              button?.endIcon ? (
                <Icon name={button?.endIcon} />
              ) : button?.startIcon ? (
                <Icon name={button?.startIcon} />
              ) : undefined
            }
            iconPosition={button?.endIcon ? "end" : "start"}
          >
            {button?.label}
          </ButtonV2>
        )}
      </Stack>
    </Stack>
  );
};

export default TableEmptyScreen;
