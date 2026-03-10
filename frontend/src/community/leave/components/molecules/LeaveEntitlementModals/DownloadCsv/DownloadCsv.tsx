import { Box, Divider, Typography } from "@mui/material";
import { useEffect, useMemo } from "react";

import { Button } from "@rootcodelabs/skapp-ui";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { AccountSignIn } from "~community/common/constants/stringConstants";

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
      <Button variant={"secondary"} onClick={handleDownloadBtnClick} icon={<Icon name={IconName.DOWNLOAD_ICON} />} iconPosition="end">{translateText(["downloadCsvButton"])}</Button>
      <Divider sx={classes.divider} aria-hidden={true} />
      <Button variant={"primary"} onClick={() =>
          setLeaveEntitlementModalType(LeaveEntitlementModelTypes.UPLOAD_CSV)
        } icon={<Icon name={IconName.RIGHT_ARROW_ICON} />} iconPosition="end">{translateText(["nextButton"])}</Button>
    </Box>
  );
};

export default DownloadCsv;
