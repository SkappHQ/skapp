import { Box, Stack, Typography } from "@mui/material";
import { SxProps, type Theme, useTheme } from "@mui/material/styles";
import { FC, useEffect, useState } from "react";

import ColoredCircle from "~community/common/components/atoms/ColoredCircle/ColoredCircle";
import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import {
  AvailableThemeColors,
  ThemeTypes
} from "~community/common/types/AvailableThemeColors";
import { mergeSx } from "~community/common/utils/commonUtil";

import { styles } from "./styles";

interface Props {
  label?: string;
  inputType?: "password" | "text" | "email";
  inputName: string;
  inputStyle?: SxProps;
  value: string | number | boolean;
  onSelect?: (key: string, value: string | number | boolean) => void;
  error: string;
  componentStyle?: SxProps;
  tooltip?: string;
  isDisabled?: boolean;
}

const ColorInputField: FC<Props> = ({
  label,
  inputStyle,
  inputName,
  value,
  onSelect,
  error,
  componentStyle,
  tooltip
}) => {
  const theme: Theme = useTheme();
  const classes = styles(theme, error);
  const defaultColor = ThemeTypes.BLUE_THEME;

  const [selectedColor, setSelectedColor] = useState<string>(defaultColor);

  useEffect(() => {
    setSelectedColor((value as string) ?? defaultColor);
    onSelect?.(inputName, value ?? defaultColor);
  }, []);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    onSelect?.(inputName, color);
  };

  return (
    <Box sx={mergeSx([classes.container, componentStyle])}>
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        gap="1.25rem"
      >
        <Typography component="label" lineHeight={1.5} sx={{}}>
          {label}
        </Typography>
        {tooltip && (
          <Tooltip
            title={tooltip}
            spanStyles={{
              width: "1.25rem",
              height: "1.25rem",
              borderRadius: "50%"
            }}
          />
        )}
      </Stack>
      <Box sx={mergeSx([classes.colorContainer, inputStyle])}>
        {AvailableThemeColors?.map((color) => (
          <ColoredCircle
            dataTestId={`colored-circle-${color}`}
            key={color}
            color={color}
            isSelected={color === selectedColor}
            onClick={() => handleColorChange(color)}
          />
        ))}
      </Box>
      {!!error && (
        <Typography
          role="alert"
          aria-live="assertive"
          variant="body2"
          sx={classes.errorText}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default ColorInputField;
