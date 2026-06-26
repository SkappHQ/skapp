import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))<{ customstyles?: any }>(({ theme, customstyles }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black,
    border: `0.0625rem solid ${theme.palette.grey.A100}`,
    ...customstyles?.tooltip
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.white,
    "&::before": {
      backgroundColor: theme.palette.common.white,
      border: `0.0625rem solid ${theme.palette.grey.A100}`
    },
    ...customstyles?.arrow
  }
}));

export default StyledTooltip;
