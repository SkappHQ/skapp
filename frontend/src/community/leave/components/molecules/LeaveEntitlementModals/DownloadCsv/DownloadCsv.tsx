import { Box, Divider, Typography } from "@mui/material";
import { useEffect, useMemo } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import { AccountSignIn } from "~community/common/constants/stringConstants";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { useGetLeaveTypes } from "~community/leave/api/LeaveTypesApi";
import { LeaveEntitlementModelTypes } from "~community/leave/enums/LeaveEntitlementEnums";
import { useLeaveStore } from "~community/leave/store/store";
import { downloadLeaveEntitlementBulkUploadTemplate } from "~community/leave/utils/leaveEntitlement/leaveEntitlementUtils";
import { useGetAllEmployeeData } from "~community/people/api/PeopleApi";
import { usePeopleStore } from "~community/people/store/store";
import { EmployeeDataType } from "~community/people/types/EmployeeTypes";

import styles from "./styles";

const DownloadCsv = () => {
  const classes = styles();

  const translateText = useTranslator("leaveModule", "leaveEntitlements");

  const { setLeaveEntitlementModalType } = useLeaveStore((state) => state);

  const { setEmployeeDataParams } = usePeopleStore((state) => state);

  const { data: leaveTypes } = useGetLeaveTypes();

  const { data: employeeData } = useGetAllEmployeeData();

  useEffect(() => {
    setEmployeeDataParams("isExport", true);
    setEmployeeDataParams(
      "accountStatus",
      `${AccountSignIn.PENDING},${AccountSignIn.ACTIVE}`
    );
  }, [setEmployeeDataParams]);

  const activeLeaveTypes = useMemo(() => {
    return leaveTypes?.filter((leaveType) => leaveType.isActive);
  }, [leaveTypes]);

  const handleDownloadBtnClick = () => {
    downloadLeaveEntitlementBulkUploadTemplate(
      activeLeaveTypes ?? [],
      employeeData as unknown as EmployeeDataType[]
    );
  };

  return (
    <Box sx={classes.wrapper}>
      <Typography
        variant="body1"
        sx={classes.description}
        id="upload-csv-modal-title"
      >
        {translateText(["downloadCsvModalDes"])}
      </Typography>
      <Button
        accessibility={{
          ariaHidden: true
        }}
        label={translateText(["downloadCsvButton"])}
        buttonStyle={ButtonStyle.SECONDARY}
        styles={classes.downloadBtn}
        endIcon={IconName.DOWNLOAD_ICON}
        onClick={handleDownloadBtnClick}
      />
      <Divider sx={classes.divider} aria-hidden={true} />
      <Button
        accessibility={{
          ariaHidden: true
        }}
        label={translateText(["nextButton"])}
        endIcon={IconName.RIGHT_ARROW_ICON}
        buttonStyle={ButtonStyle.PRIMARY}
        styles={classes.nextBtn}
        onClick={() =>
          setLeaveEntitlementModalType(LeaveEntitlementModelTypes.UPLOAD_CSV)
        }
      />
    </Box>
  );
};

export default DownloadCsv;
