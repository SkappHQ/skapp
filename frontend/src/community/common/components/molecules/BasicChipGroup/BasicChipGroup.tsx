import { Popper, type PopperOwnProps } from "@mui/base";
import { Box, Fade, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { Stack, type SxProps, styled } from "@mui/system";
import { type FC, useRef, useState } from "react";

import BasicChip from "../../atoms/Chips/BasicChip/BasicChip";

interface Props {
  values: string[];
  max: number;
  chipStyles?: SxProps;
  showHoverModal?: boolean;
  modalPosition?: PopperOwnProps["placement"];
  hoverStyles?: SxProps;
}

const StyledPopper = styled(Popper)`
  z-index: 1301;
`;

const BasicChipGroup: FC<Props> = ({
  values,
  max,
  chipStyles,
  showHoverModal,
  modalPosition,
  hoverStyles
}) => {
  const theme: Theme = useTheme();
  const anchorElement = useRef<HTMLDivElement>(null);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const onMouseEnter = (): void => {
    setAnchorEl(anchorElement.current);
  };
  const onMouseLeave = (): void => {
    setAnchorEl(null);
  };

  return (
    <>
      <Stack direction={"row"} gap="0.25rem">
        {values?.map((item, index) =>
          index < max ? (
            <BasicChip
              key={index}
              label={item}
              chipStyles={chipStyles}
              tabIndex={-1}
              ariaHidden={true}
            />
          ) : null
        )}
        {values?.length > max && (
          <Box
            ref={anchorElement}
            sx={{ cursor: showHoverModal ? "pointer" : "" }}
          >
            <BasicChip
              label={`+${values?.length - max}`}
              chipStyles={chipStyles}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              tabIndex={-1}
              ariaHidden={true}
            />
          </Box>
        )}
      </Stack>
      <StyledPopper
        open={showHoverModal && Boolean(anchorEl) ? true : false}
        anchorEl={anchorEl}
        placement={modalPosition ?? "bottom-start"}
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={0}>
            <Box
              sx={{
                backgroundColor: theme.palette.common.white,
                width: "auto",
                borderRadius: ".75rem",
                overflow: "hidden",
                boxShadow: `0rem .25rem 1.25rem 0rem ${theme.palette.grey.A100}`,
                p: ".75rem 1.75rem .75rem .75rem",
                ml: ".5rem",
                ...hoverStyles
              }}
            >
              <Stack direction={"column"} gap="0.5rem">
                {values?.map((item, index) =>
                  index >= max ? (
                    <Typography
                      key={index}
                      sx={{
                        color: theme.palette.text.primary,
                        fontSize: "0.75rem",
                        lineHeight: "1.125rem"
                      }}
                    >
                      {item}
                    </Typography>
                  ) : null
                )}
              </Stack>
            </Box>
          </Fade>
        )}
      </StyledPopper>
    </>
  );
};

export default BasicChipGroup;
