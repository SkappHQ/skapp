import { Box, Theme, useTheme } from "@mui/material";

const CircularProgressSkeleton = () => {
  const theme: Theme = useTheme();
  return (
    <Box
      sx={{
        height: "2rem",
        width: "2rem"
      }}
    >
      <svg viewBox="0 0 36 36">
        <circle
          style={{
            transform: "rotate(-180deg)",
            transformOrigin: "50% 50%"
          }}
          stroke={theme.palette.grey.A100}
          strokeWidth="4"
          fill="none"
          cx="18"
          cy="18"
          r="16"
        />
        <circle
          style={{
            transform: "rotate(-180deg)",
            transformOrigin: "50% 50%"
          }}
          stroke={theme.palette.grey[200]}
          strokeWidth="4"
          strokeDasharray="40, 60"
          fill="none"
          cx="18"
          cy="18"
          r="16"
        />
      </svg>
    </Box>
  );
};

export default CircularProgressSkeleton;
