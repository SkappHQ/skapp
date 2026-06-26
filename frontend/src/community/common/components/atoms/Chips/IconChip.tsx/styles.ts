import { SxProps } from "@mui/material";

interface chipProps {
  isResponsive: boolean;
  isMediumScreen: boolean;
  textTransform: "capitalize" | "uppercase" | "lowercase" | "none" | undefined;
  hasEndIcon: boolean;
  emojiSize?: string;
  chipStyles?: SxProps;
}

const styles = () => ({
  chip: (props: chipProps) => {
    const {
      isResponsive,
      isMediumScreen,
      textTransform,
      hasEndIcon,
      emojiSize,
      chipStyles
    } = props;

    return {
      backgroundColor: "common.white",
      minWidth: "0rem",
      borderRadius: "4rem",
      fontWeight: "400",
      height: "auto",
      alignItems: "center",
      py: ".625rem",
      px: ".625rem",
      fontSize: emojiSize ?? ".875rem",
      textTransform,
      "& .MuiChip-label": {
        paddingRight: isResponsive && isMediumScreen ? "0rem" : ".5rem",
        paddingLeft:
          isResponsive && isMediumScreen ? "0rem" : hasEndIcon ? 0 : ".5rem",
        lineHeight: "1.125rem"
      },
      ...chipStyles
    };
  }
});

export default styles;
