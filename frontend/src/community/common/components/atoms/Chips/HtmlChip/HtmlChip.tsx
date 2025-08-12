import { useTheme } from "@mui/material";
import React from "react";

import { getEmoji } from "~community/common/utils/commonUtil";

const HtmlChip = ({
  className,
  emoji,
  text,
  customStyles = {
    text: {},
    emoji: {}
  }
}: {
  className?: string;
  emoji?: string;
  text: string;
  customStyles?: {
    text?: React.CSSProperties;
    emoji?: React.CSSProperties;
  };
}) => {
  const theme = useTheme();

  return (
    <span
      role="status"
      style={{
        fontSize: "0.75rem",
        lineHeight: "1rem",
        padding: emoji ? "0.25rem 1rem 0.25rem 0.1875rem" : "0.25rem 1rem",
        borderRadius: "6.25rem",
        backgroundColor: theme.palette.common.white,
        border: `0.0625rem solid ${theme.palette.grey[500]}`,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "100%",
        display: "inline-block",
        verticalAlign: "middle",
        fontFamily: theme.typography.fontFamily,
        ...customStyles.text
      }}
    >
      {emoji ? (
        <span
          className={className}
          style={{
            marginRight: "0.25rem",
            borderRadius: "100%",
            fontSize: "0.5rem",
            padding: "0.125rem",
            ...customStyles.emoji
          }}
        >
          {getEmoji(emoji)}
        </span>
      ) : (
        <></>
      )}
      {text}
    </span>
  );
};

export default HtmlChip;
