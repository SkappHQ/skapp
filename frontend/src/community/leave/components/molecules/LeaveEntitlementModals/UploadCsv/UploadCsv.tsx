import { Divider, Stack, Typography } from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import DragAndDropField from "~community/common/components/molecules/DragAndDropField/DragAndDropField";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { BulkUploadResponse } from "~community/common/types/BulkUploadTypes";
import { FileUploadType } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import {
  useGetLeaveEntitlements,
  useLeaveEntitlementBulkUpload
} from "~community/leave/api/LeaveEntitlementApi";
import { useGetLeaveTypes } from "~community/leave/api/LeaveTypesApi";
import {
  LeaveEntitlementModelTypes,
  LeaveEntitlementToastEnums
} from "~community/leave/enums/LeaveEntitlementEnums";
import { useLeaveStore } from "~community/leave/store/store";
import { LeaveTypeType } from "~community/leave/types/AddLeaveTypes";
import { LeaveEntitlementBulkUploadType } from "~community/leave/types/LeaveEntitlementTypes";
import { handleLeaveEntitlementApiResponse } from "~community/leave/utils/leaveEntitlement/apiUtils";
import { setAttachment } from "~community/leave/utils/leaveEntitlement/uploadCsvUtils";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";

import styles from "./styles";

interface Props {
  leaveTypes: LeaveTypeType[];
  setLeaveTypes: Dispatch<SetStateAction<LeaveTypeType[]>>;
  setErrorLog: Dispatch<SetStateAction<BulkUploadResponse | null>>;
}

const UploadCsv = ({ leaveTypes, setLeaveTypes, setErrorLog }: Props) => {
  const classes = styles();

  const translateText = useTranslator("leaveModule", "leaveEntitlements");

  const { setToastMessage } = useToast();

  const { data: leaveTypesData } = useGetLeaveTypes();

  const {
    leaveEntitlementTableSelectedYear,
    setLeaveEntitlementModalType,
    page
  } = useLeaveStore((state) => ({
    leaveEntitlementTableSelectedYear: state.leaveEntitlementTableSelectedYear,
    setLeaveEntitlementModalType: state.setLeaveEntitlementModalType,
    page: state.page
  }));

  const [customError, setCustomError] = useState<string>("");
  const [isValid, setValid] = useState<boolean>(false);
  const [bulkLeaveAttachment, setBulkUserAttachment] = useState<
    FileUploadType[]
  >([]);
  const [leaveEntitlementBulk, setLeaveEntitlementBulk] = useState<
    LeaveEntitlementBulkUploadType[]
  >([]);

  const activeLeaveTypes = useMemo(() => {
    return leaveTypesData?.filter((leaveType) => leaveType.isActive);
  }, [leaveTypesData]);

  useEffect(() => {
    setLeaveTypes(activeLeaveTypes ?? []);
  }, [activeLeaveTypes]);

  const { data: leaveEntitlementData } = useGetLeaveEntitlements(
    leaveEntitlementTableSelectedYear,
    page,
    ""
  );

  const isReupload =
    leaveEntitlementData?.items && leaveEntitlementData.items.length > 0;

  const { sendEvent } = useGoogleAnalyticsEvent();

  const onSuccess = (errorLogs: BulkUploadResponse) => {
    const toastType =
      errorLogs?.bulkStatusSummary?.failedCount === 0
        ? LeaveEntitlementToastEnums.BULK_UPLOAD_COMPLETE_SUCCESS
        : errorLogs?.bulkStatusSummary?.successCount !== 0
          ? LeaveEntitlementToastEnums.BULK_UPLOAD_PARTIAL_SUCCESS
          : "";
    if (toastType !== "") {
      handleLeaveEntitlementApiResponse({
        type: toastType,
        setToastMessage,
        translateText,
        selectedYear: leaveEntitlementTableSelectedYear,
        noOfRecords: errorLogs?.bulkStatusSummary?.successCount,
        isReupload,
        sendEvent
      });
    }
    setErrorLog(errorLogs);
    setLeaveEntitlementBulk([]);
    setBulkUserAttachment([]);
    setCustomError("");
    setValid(false);
    setLeaveEntitlementModalType(
      errorLogs?.bulkStatusSummary?.failedCount === 0
        ? LeaveEntitlementModelTypes.NONE
        : LeaveEntitlementModelTypes.BULK_UPLOAD_SUMMARY
    );
  };

  const onError = () => {
    handleLeaveEntitlementApiResponse({
      type: LeaveEntitlementToastEnums.BULK_UPLOAD_ERROR,
      setToastMessage,
      translateText
    });
    setErrorLog(null);
  };

  const {
    mutate: leaveEntitlementBulkUploadMutate,
    isPending: leaveEntitlementBulkUploadPending
  } = useLeaveEntitlementBulkUpload(onSuccess, onError);

  const handleUploadBtnClick = () => {
    leaveEntitlementBulkUploadMutate({
      year: leaveEntitlementTableSelectedYear,
      entitlementDetailsList: leaveEntitlementBulk
    });
  };

  const handleBackBtnClick = () => {
    setLeaveEntitlementModalType(LeaveEntitlementModelTypes.DOWNLOAD_CSV);
    setBulkUserAttachment([]);
  };

  return (
    <Stack sx={classes.wrapper}>
      <Typography
        variant="body1"
        sx={classes.description}
        id="upload-csv-modal-description"
      >
        {translateText(["uploadCsvModalDes"])}
      </Typography>
      <DragAndDropField
        accessibility={{
          componentName: translateText(["title"]),
          ariaDescribedBy: "upload-csv-modal-description",
          ariaHidden: true
        }}
        setAttachments={(acceptedFiles: FileUploadType[]) =>
          setAttachment({
            acceptedFiles,
            leaveTypes,
            selectedYear: leaveEntitlementTableSelectedYear,
            setCustomError,
            setValid,
            setLeaveEntitlementBulk,
            setBulkUserAttachment,
            translateText
          })
        }
        accept={{
          "text/csv": [".csv"]
        }}
        uploadableFiles={bulkLeaveAttachment}
        supportedFiles={"CSV"}
        maxFileSize={1}
        customError={customError}
      />
      <Divider sx={classes.divider} aria-hidden={true} />
      <Button
        accessibility={{
          ariaHidden: true
        }}
        label={translateText(["uploadButton"])}
        endIcon={IconName.RIGHT_ARROW_ICON}
        buttonStyle={ButtonStyle.PRIMARY}
        styles={classes.uploadButton}
        onClick={handleUploadBtnClick}
        disabled={!isValid}
        isLoading={leaveEntitlementBulkUploadPending}
      />
      <Button
        accessibility={{
          ariaHidden: true
        }}
        label={translateText(["goBackButton"])}
        startIcon={IconName.LEFT_ARROW_ICON}
        buttonStyle={ButtonStyle.TERTIARY}
        onClick={handleBackBtnClick}
      />
    </Stack>
  );
};

export default UploadCsv;
