import { Box, Stack } from "@mui/material";
import { FC } from "react";

interface ObjectiveListItemProps {
  period: number;
  title: string;
  onClick?: () => void;
}

const ObjectiveListItem: FC<ObjectiveListItemProps> = ({
  period,
  title,
  onClick
}) => {
  return (
    <Box
      sx={{
        width: "100%",
        border: "1px solid #e0e0e0",
        borderRadius: "0.5rem",
        padding: { xs: "1rem", sm: "1.5rem" },
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        minHeight: { xs: "auto", sm: "4rem" },
        cursor: onClick ? "pointer" : "default",
        "&:hover": {
          backgroundColor: onClick ? "#f9f9f9" : "transparent"
        }
      }}
      onClick={onClick}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{
          alignItems: { xs: "flex-start", sm: "center" },
          width: "100%",
          gap: { xs: "0.5rem", sm: "0" }
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", sm: "200px" },
            paddingRight: { xs: "0", sm: "1rem" },
            color: "#333",
            fontSize: { xs: "0.875rem", sm: "1rem" },
            fontWeight: { xs: "600", sm: "400" }
          }}
        >
          {period}
        </Box>
        <Box
          sx={{
            flex: 1,
            color: "#333",
            fontSize: { xs: "0.875rem", sm: "1rem" },
            lineHeight: { xs: "1.25", sm: "1.5" }
          }}
        >
          {title}
        </Box>
      </Stack>
    </Box>
  );
};

export default ObjectiveListItem;
