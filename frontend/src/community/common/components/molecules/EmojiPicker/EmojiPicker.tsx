import {
  Box,
  ClickAwayListener,
  Fade,
  IconButton,
  InputBase,
  Paper,
  Popper,
  Stack,
  Typography
} from "@mui/material";
import { type SxProps, type Theme, useTheme } from "@mui/material/styles";
import { default as EmojiPickerReact } from "emoji-picker-react";
import { ChangeEventHandler, JSX, useRef, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

import { styles } from "./styles";

interface Props {
  label?: string;
  inputName: string;
  componentStyle?: SxProps;
  tooltip?: string;
  value: string;
  onChange?: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  error?: string;
  formik?: any;
  setUnicode: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

const EmojiPicker = ({
  label,
  inputName,
  componentStyle,
  tooltip,
  value,
  onChange,
  error,
  formik,
  required,
  setUnicode,
  placeholder
}: Props): JSX.Element => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const translateAria = useTranslator(
    "commonAria",
    "components",
    "emojiPicker"
  );

  const anchorEl = useRef<HTMLDivElement | null>(null);

  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);

  const handleClose = (): void => {
    setIsPickerOpen(false);
  };

  const handelValue = (value: string, unicode: string): void => {
    setUnicode(unicode);
    formik.setFieldValue(inputName, value);
    formik.setFieldError(inputName, "");
    setIsPickerOpen(false);
  };

  return (
    <Stack sx={componentStyle}>
      <Stack sx={classes.labelWrapper}>
        <Typography
          component="label"
          id="emoji-picker-label"
          sx={{
            color: error
              ? theme.palette.error.contrastText
              : theme.palette.common.black
          }}
        >
          {label}
          {required && (
            <Typography component="span" sx={classes.asterisk}>
              &nbsp; *
            </Typography>
          )}
        </Typography>
        {tooltip && (
          <Tooltip
            id="emoji-field"
            title={tooltip}
            ariaLabel={tooltip}
            iconColor={
              error
                ? theme.palette.error.contrastText
                : theme.palette.common.black
            }
          />
        )}
      </Stack>
      <Paper
        elevation={0}
        sx={{
          ...classes.paper,
          backgroundColor: error
            ? theme.palette.error.light
            : theme.palette.grey[100],
          border: error
            ? `${theme.palette.error.contrastText} 0.0625rem solid`
            : "none"
        }}
      >
        <InputBase
          ref={anchorEl}
          sx={classes.input}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          inputProps={{ readOnly: true, tabIndex: -1 }}
          endAdornment={
            <IconButton
              sx={classes.button}
              onClick={() => setIsPickerOpen((previousOpen) => !previousOpen)}
              tabIndex={0}
              aria-label={translateAria(["icon"])}
              aria-haspopup="true"
              aria-expanded={isPickerOpen ? "true" : undefined}
            >
              <Icon name={IconName.EMOJI_ICON} />
            </IconButton>
          }
        />
      </Paper>
      <Popper
        open={isPickerOpen}
        anchorEl={anchorEl.current}
        placement="bottom-start"
        modifiers={[
          {
            name: "flip",
            enabled: false,
            options: {
              altBoundary: true,
              rootBoundary: "document",
              padding: 8
            }
          }
        ]}
        transition
        style={{
          width: `${anchorEl?.current?.clientWidth}px`,
          height: "18.75rem"
        }}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Fade {...TransitionProps} timeout={100}>
              <Box sx={classes.popperWrapper}>
                <EmojiPickerReact
                  lazyLoadEmojis={true}
                  onEmojiClick={({
                    emoji,
                    unified
                  }: {
                    emoji: string;
                    unified: string;
                  }) => {
                    handelValue(emoji, unified);
                  }}
                  previewConfig={{ showPreview: false }}
                  style={{ width: "100%", height: "100%" }}
                />
              </Box>
            </Fade>
          </ClickAwayListener>
        )}
      </Popper>
      {!!error && (
        <Typography
          role="alert"
          aria-live="assertive"
          variant="body2"
          sx={classes.error}
        >
          {error}
        </Typography>
      )}
    </Stack>
  );
};

export default EmojiPicker;
