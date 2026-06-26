import {
  Box,
  Menu,
  Stack,
  type SxProps,
  type Theme,
  useTheme
} from "@mui/material";
import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";

import { useCommonStore } from "~community/common/stores/commonStore";

import styles from "./styles";

type ChipListTypes = {
  chipList: string[];
  maxWidth: SxProps;
  chipStyles?: SxProps;
  hiddenChipStyles?: SxProps;
  chipWrapperStyles?: SxProps;
};

const ChipList = ({
  chipList,
  chipStyles,
  hiddenChipStyles,
  maxWidth,
  chipWrapperStyles
}: ChipListTypes) => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);

  const setWrapperRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      wrapperRef.current = node;
    }
  }, []);

  const setMeasureRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      measureRef.current = node;
    }
  }, []);

  const { isDrawerToggled } = useCommonStore((state) => ({
    isDrawerToggled: state.isDrawerExpanded
  }));

  const [visibleChips, setVisibleChips] = useState<string[]>([]);
  const [hiddenChips, setHiddenChips] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleMenuBtnClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const calculateVisibleChips = useCallback(() => {
    if (wrapperRef.current && measureRef.current) {
      const wrapperWidth = wrapperRef.current.offsetWidth;
      const chipElements = Array.from(
        measureRef.current.children
      ) as HTMLDivElement[];
      let usedWidth = 0;
      const visible: string[] = [];
      const hidden: string[] = [];

      const hiddenChipCounterWidth = 61.11;
      const chipGap = 10;

      chipElements?.forEach((chipElement, index) => {
        const chipWidth = chipElement.offsetWidth;

        if (usedWidth + chipWidth + hiddenChipCounterWidth <= wrapperWidth) {
          visible.push(chipList[index]);
          usedWidth += chipWidth + chipGap;
        } else {
          hidden.push(chipList[index]);
        }
      });

      setVisibleChips(visible);
      setHiddenChips(hidden);
    }
  }, [chipList]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(calculateVisibleChips);

    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    return () => {
      if (wrapperRef.current) {
        resizeObserver.unobserve(wrapperRef.current);
      }
    };
  }, [calculateVisibleChips]);

  useEffect(() => {
    calculateVisibleChips();
  }, [chipList, isDrawerToggled, calculateVisibleChips]);

  return (
    <>
      <Stack
        ref={setWrapperRef}
        sx={{
          ...maxWidth,
          ...classes.chipsWrapper,
          ...chipWrapperStyles
        }}
      >
        {visibleChips?.length > 0 &&
          visibleChips?.map((chip, index) => (
            <Box
              key={`${chip}-${index}`}
              sx={{ ...classes.chips, ...chipStyles }}
            >
              {chip}
            </Box>
          ))}
        {hiddenChips?.length > 0 && (
          <Box>
            <Box
              sx={{ ...classes.chips, ...chipStyles }}
              onMouseEnter={handleMenuBtnClick}
              onClick={handleMenuBtnClick}
            >
              +{hiddenChips?.length}
            </Box>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "top",
                horizontal: "left"
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left"
              }}
              sx={classes.menu}
            >
              <Box sx={classes.menuList} onMouseLeave={handleMenuClose}>
                {hiddenChips?.length > 0 &&
                  hiddenChips?.map(
                    (chip, index) =>
                      index % 2 === 0 && (
                        <Box key={chip} sx={classes.menuItemRow}>
                          {/* TODO: type error */}
                          <Box sx={{ ...classes.chips, ...hiddenChipStyles }}>
                            {chip}
                          </Box>
                          {/* TODO: type error */}
                          {hiddenChips[index + 1] && (
                            <Box sx={{ ...classes.chips, ...hiddenChipStyles }}>
                              {hiddenChips[index + 1]}
                            </Box>
                          )}
                        </Box>
                      )
                  )}
              </Box>
            </Menu>
          </Box>
        )}
      </Stack>
      <Box ref={setMeasureRef} sx={classes.widthCounter}>
        {chipList?.map((chip, index) => (
          <Box
            key={`${chip}-${index}`}
            sx={{ ...classes.chips, ...chipStyles }} // TODO: type error
          >
            {chip}
          </Box>
        ))}
      </Box>
    </>
  );
};

export default ChipList;
