import { Box, Link, Stack, Typography } from "@mui/material";

import { useTranslator } from "~community/common/hooks/useTranslator";

interface Props {
  onRetry: () => void;
  isRetrying: boolean;
}

const LeavePolicyAllocationErrorState = ({ onRetry, isRetrying }: Props) => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "leavePolicyAllocation",
    "errorState"
  );

  return (
    <Box sx={{ width: "100%" }} role="alert">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        gap="0.5rem"
        sx={{ padding: "1.5rem", borderRadius: "0.75rem" }}
      >
        <Typography variant="body2">{translateText(["message"])}</Typography>
        <Link
          component="button"
          type="button"
          variant="body2"
          underline="always"
          disabled={isRetrying}
          onClick={onRetry}
        >
          {translateText(["retry"])}
        </Link>
      </Stack>
    </Box>
  );
};

export default LeavePolicyAllocationErrorState;
