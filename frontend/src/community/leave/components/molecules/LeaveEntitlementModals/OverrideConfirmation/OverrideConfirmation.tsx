import { Box, Typography } from "@mui/material";

import Button from "~community/common/components/atoms/Button/Button";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
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
      <Typography
        id="override-confirmation-description"
        variant="body1"
        sx={classes.textOne}
      >
        {translateText(["overrideConfirmationModalDes"], {
          uploadingYear: selectedYear
        })}
      </Typography>
      <Typography variant="body1" sx={classes.textTwo}>
        {translateText(["overrideConfirmationTxt"])}
      </Typography>
      <Button
        accessibility={{
          ariaDescribedBy: "override-confirmation-description"
        }}
        label={translateText(["proceedBtnTxt"])}
        endIcon={IconName.RIGHT_ARROW_ICON}
        buttonStyle={ButtonStyle.PRIMARY}
        styles={classes.proceedBtn}
        onClick={() =>
          setLeaveEntitlementModalType(LeaveEntitlementModelTypes.DOWNLOAD_CSV)
        }
        isLoading={false}
      />
      <Button
        label={translateText(["cancelBtnTxt"])}
        endIcon={IconName.CLOSE_ICON}
        buttonStyle={ButtonStyle.TERTIARY}
        onClick={() =>
          setLeaveEntitlementModalType(LeaveEntitlementModelTypes.NONE)
        }
      />
    </Box>
  );
};

export default OverrideConfirmation;
