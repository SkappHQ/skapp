import { Stack, SxProps, Theme, Typography, useTheme } from "@mui/material";
import { FC } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { IconName } from "~community/common/types/IconTypes";
import { mergeSx } from "~community/common/utils/commonUtil";

import styles from "./styles";

export interface TableEmptyScreenProps {
  title?: string;
  description?: string;
  button?: {
    id?: string;
    shouldBlink?: boolean;
    buttonStyle?: ButtonStyle;
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
  button = {
    buttonStyle: ButtonStyle.PRIMARY
  },
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
          <Button
            id={button?.id}
            shouldBlink={button?.shouldBlink}
            label={button?.label}
            accessibility={{
              ariaDescribedBy: descriptionId
            }}
            startIcon={
              button?.startIcon ? <Icon name={button?.startIcon} /> : <></>
            }
            endIcon={<Icon name={button?.endIcon ?? IconName.ADD_ICON} />}
            buttonStyle={button?.buttonStyle}
            isFullWidth={false}
            onClick={button?.onClick}
            styles={mergeSx([classes.button, button?.styles])}
          />
        )}
      </Stack>
    </Stack>
  );
};

export default TableEmptyScreen;
