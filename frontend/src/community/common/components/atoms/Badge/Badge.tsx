import { Box, Theme, useTheme } from "@mui/material";
import React from "react";

interface BadgeProps {
  text: string;
}

const Badge: React.FC<BadgeProps> = ({ text }) => {
  const theme: Theme = useTheme();

  return (
    <Box
      sx={{
        background: `linear-gradient(125.5deg, ${theme.palette.primary.dark} 15.65%, ${theme.palette.primary.main} 77.4%)`,
        borderRadius: "99px",
        padding: "6px 6px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "fit-content",
        height: "16px"
      }}
    >
      <span
        style={{
          color: theme.palette.text.whiteText,
          fontWeight: 600,
          fontSize: "8px",
          lineHeight: "8px",
          margin: 0,
          padding: 0
        }}
      >
        {text}
      </span>
    </Box>
  );
};

export default Badge;
