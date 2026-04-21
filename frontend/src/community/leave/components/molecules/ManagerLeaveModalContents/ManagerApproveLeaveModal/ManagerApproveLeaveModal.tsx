import { Box, Stack, Typography } from "@mui/material";
import { Dispatch, JSX, SetStateAction, useEffect, useState } from "react";

import { useGetUploadedLeaveAttachments } from "~community/common/api/FileHandleApi";
import CheckIcon from "~community/common/assets/Icons/CheckIcon";
import CloseIcon from "~community/common/assets/Icons/CloseIcon";
import CopyIcon from "~community/common/assets/Icons/CopyIcon";
import Button from "~community/common/components/atoms/Button/Button";
import ReadOnlyChip from "~community/common/components/atoms/Chips/BasicChip/ReadOnlyChip";
import IconChip from "~community/common/components/atoms/Chips/IconChip.tsx/IconChip";
import Avatar from "~community/common/components/molecules/Avatar/Avatar";
import { appModes } from "~community/common/constants/configs";
import { FileTypes } from "~community/common/enums/CommonEnums";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useHandelLeaves } from "~community/leave/api/LeaveApi";
import { useLeaveStore } from "~community/leave/store/store";
import {
  LeaveExtraPopupTypes,
  LeaveStatusTypes
} from "~community/leave/types/LeaveRequestTypes";
import { getFileNameOfAttachmentFromUrl } from "~community/leave/utils/getFileNameofAttachedFiles/getFileNamesofAttachments";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import useS3Download from "~enterprise/common/hooks/useS3Download";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

import LeaveStatusPopupColumn from "../LeaveStatusPopupColumn/LeaveStatusPopupColumn";

interface Props {
  setPopupType: Dispatch<SetStateAction<string>>;
}

const ManagerApproveLeaveModal = ({ setPopupType }: Props): JSX.Element => {
  const leaveRequestData = useLeaveStore((state) => state.leaveRequestData);
  const { mutate, isSuccess, error: leaveError } = useHandelLeaves();
  const { setToastMessage } = useToast();
  const environment = useGetEnvironment();

  const [attachment, setAttachment] = useState<string | null>(null);
  const [currentAttachmentFormat, setCurrentAttachmentFormat] = useState<
    string | null
  >(null);
  const { s3FileUrls, downloadS3File } = useS3Download();
  const translateText = useTranslator(
    "leaveModule",
    "leaveRequests",
    "leaveManagerEmployee"
  );

  const commonTranslateText = useTranslator("words");

  const translateAria = useTranslator("leaveAria", "allLeaveRequests");

  const handleApprove = (): void => {
    const requestData = {
      leaveRequestId: leaveRequestData?.leaveId as number,
      status: LeaveStatusTypes.APPROVED.toUpperCase(),
      reviewerComment: ""
    };
    mutate(requestData);
  };

  const handleDeclineModel = (): void => {
    setPopupType(LeaveExtraPopupTypes.DECLINE);
  };

  const { data: leaveAttachment, refetch } = useGetUploadedLeaveAttachments(
    FileTypes.LEAVE_ATTACHMENTS,
    attachment,
    false
  );

  const { sendEvent } = useGoogleAnalyticsEvent();

  useEffect(() => {
    if (leaveError) {
      setToastMessage({
        open: true,
        toastType: "error",
        title: translateText(["approveLeaveFailTitle"]),
        description: translateText(["approveLeaveFailDesc"]),
        isIcon: true
      });
    } else if (isSuccess) {
      setToastMessage({
        open: true,
        toastType: "success",
        title: translateText(["approveLeaveSuccessTitle"]),
        description: translateText(["approveLeaveSuccessDesc"]),
        isIcon: true
      });
      sendEvent(GoogleAnalyticsTypes.GA4_LEAVE_REQUEST_APPROVED);
    }
  }, [leaveRequestData?.empName, leaveError, isSuccess]);

  useEffect(() => {
    if (isSuccess) {
      setPopupType(LeaveExtraPopupTypes.APPROVED_STATUS);
    }
  }, [leaveRequestData.leaveType, isSuccess, setPopupType]);

  const downloadAttachment = (url: string) => {
    setAttachment(url);
    setCurrentAttachmentFormat(url.split(".")[1]);
  };

  const downloadFileToDevice = (fileContent: Blob): void => {
    try {
      const url = window.URL.createObjectURL(fileContent);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attachment.${currentAttachmentFormat}`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setAttachment(null);
    } catch (error) {
      console.error("error ", error);
    }
  };

  const downloadFileFromS3 = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const blob = await response.blob();
      const fileName = url.split("?")[0].split("/").pop() || "Attachment";
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);

      setAttachment(null);
    } catch (error) {
      console.error("Error downloading file from S3:", error);
    }
  };

  useEffect(() => {
    if (attachment) {
      if (environment === appModes.COMMUNITY) {
        refetch();
      } else if (environment === appModes.ENTERPRISE) {
        downloadS3File({ filePath: attachment });
      }
    }
  }, [attachment]);

  useEffect(() => {
    if (environment === appModes.COMMUNITY && leaveAttachment) {
      downloadFileToDevice(leaveAttachment);
    }
    setAttachment(null);
  }, [leaveAttachment, environment]);

  useEffect(() => {
    if (environment === appModes.ENTERPRISE) {
      downloadFileFromS3(s3FileUrls[attachment as string]);
    }
  }, [s3FileUrls, environment]);
  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ marginBottom: "0.75rem" }}
        component="div"
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          tabIndex={0}
          role="group"
          aria-label={translateAria(["employeeName"], {
            firstName: leaveRequestData?.empName,
            lastName: leaveRequestData?.lastName
          })}
        >
          <Box aria-hidden="true">
            <Avatar
              firstName={leaveRequestData?.empName ?? ""}
              lastName={leaveRequestData?.lastName ?? ""}
              src={leaveRequestData.avatarUrl ?? ""}
            />
          </Box>
          <Typography
            variant="body2"
            sx={{ fontSize: "1rem" }}
            aria-hidden="true"
          >
            {translateText(["employeeName"], {
              employeeName: leaveRequestData?.empName
            }) ?? ""}
          </Typography>
        </Stack>
        <Box
          tabIndex={0}
          role="group"
          aria-label={translateAria(["leaveType"], {
            leaveType: leaveRequestData?.leaveType
          })}
        >
          <IconChip
            accessibility={{
              ariaLabel: leaveRequestData?.leaveType,
              ariaHidden: true
            }}
            label={leaveRequestData?.leaveType ?? ""}
            isTruncated={false}
            icon={leaveRequestData?.leaveEmoji ?? ""}
            chipStyles={{ backgroundColor: "grey.100", py: "0.75rem" }}
            tabIndex={-1}
          />
        </Box>
      </Stack>

      <Box
        sx={{
          maxHeight: "50vh",
          overflow: "auto"
        }}
      >
        <Box sx={{ pt: "0.75rem", pb: "1rem" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ pb: "1rem" }}
            component="div"
            tabIndex={0}
          >
            <Typography variant="body2" sx={{ fontSize: "1rem" }}>
              {translateText(["duration"])}:
            </Typography>
            <Stack direction="row" spacing={1}>
              <ReadOnlyChip
                label={
                  typeof leaveRequestData?.days === "number"
                    ? `${leaveRequestData.days} ${commonTranslateText(["days"])}`
                    : leaveRequestData.days
                }
                chipStyles={{ backgroundColor: "grey.100", py: "0.75rem" }}
              />
              <ReadOnlyChip
                label={leaveRequestData?.dates ?? ""}
                chipStyles={{ backgroundColor: "grey.100", py: "0.75rem" }}
              />
            </Stack>
          </Stack>
          <LeaveStatusPopupColumn
            label={translateText(["reason"])}
            text={
              translateText(["reasonData"], {
                reason: leaveRequestData?.reason
              }) ?? ""
            }
            isDisabled={true}
            tabIndex={0}
          />
          {leaveRequestData.attachments &&
            leaveRequestData.attachments.length > 0 && (
              <Stack
                sx={{
                  pt: "1rem",
                  gap: 1
                }}
                tabIndex={0}
              >
                <Typography variant="body2" sx={{ fontSize: "1rem" }}>
                  {translateText(["attachments"])}
                </Typography>

                <Box>
                  {leaveRequestData.attachments &&
                    leaveRequestData.attachments.length > 0 &&
                    leaveRequestData.attachments.map((attachment, index) => (
                      <IconChip
                        accessibility={{
                          ariaLabel: `Attachment ${
                            getFileNameOfAttachmentFromUrl(attachment.url) ||
                            translateText([
                              "myLeaveRequests",
                              "uploadedAttachment"
                            ])
                          }`
                        }}
                        key={index}
                        label={
                          getFileNameOfAttachmentFromUrl(attachment.url) ||
                          translateText([
                            "myLeaveRequests",
                            "uploadedAttachment"
                          ])
                        }
                        chipStyles={{
                          backgroundColor: "grey.100",
                          py: "0.75rem",
                          px: "0.75rem"
                        }}
                        icon={<CopyIcon />}
                        onClick={() => downloadAttachment(attachment.url)}
                      />
                    ))}
                </Box>
              </Stack>
            )}
        </Box>
      </Box>

      <Stack spacing={2} sx={{ mt: "1rem" }}>
        <Button
          label={translateText(["approveLeave"])}
          endIcon={<CheckIcon />}
          onClick={handleApprove}
          ariaLabel={translateText(["approveAreaLabel"])}
        />
        <Button
          buttonStyle={ButtonStyle.ERROR}
          label={translateText(["declineLeave"])}
          endIcon={<CloseIcon />}
          onClick={handleDeclineModel}
          ariaLabel={translateText(["cancelAreaLabel"])}
        />
      </Stack>
    </Box>
  );
};

export default ManagerApproveLeaveModal;
