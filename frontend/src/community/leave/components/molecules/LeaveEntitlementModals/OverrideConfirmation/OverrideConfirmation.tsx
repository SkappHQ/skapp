import { Box, Typography } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { LeaveEntitlementModelTypes } from "~community/leave/enums/LeaveEntitlementEnums";
import { useLeaveStore } from "~community/leave/store/store";

import styles from "./styles";

const OverrideConfirmation = () => {
  const classes = styles();

  const translateText = useTranslator("leaveModule", "leaveEntitlements");

  const { selectedYear, setLeaveEntitlementModalType } = useLeaveStore(
    (state) => state
  );

  return (
    <Box sx={classes.wrapper}>
      <Box id="override-confirmation-modal-title">
        <Typography variant="body1" sx={classes.textOne}>
          {translateText(["overrideConfirmationModalDes"], {
            uploadingYear: selectedYear
          })}
        </Typography>
        <Typography variant="body1" sx={classes.textTwo}>
          {translateText(["overrideConfirmationTxt"])}
        </Typography>
      </Box>
      <ButtonV2
        variant={"primary"}
        onClick={() =>
          setLeaveEntitlementModalType(LeaveEntitlementModelTypes.DOWNLOAD_CSV)
        }
        isLoading={false}
        icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
        iconPosition="end"
      >
        {translateText(["proceedBtnTxt"])}
      </ButtonV2>
      <ButtonV2
        variant={"tertiary"}
        onClick={() =>
          setLeaveEntitlementModalType(LeaveEntitlementModelTypes.NONE)
        }
        icon={<Icon name={IconName.CLOSE_ICON} />}
        iconPosition="end"
      >
        {translateText(["cancelBtnTxt"])}
      </ButtonV2>
    </Box>
  );
};

export default OverrideConfirmation;
