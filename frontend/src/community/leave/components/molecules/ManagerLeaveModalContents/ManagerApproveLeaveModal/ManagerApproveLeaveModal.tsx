import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { Dispatch, JSX, SetStateAction, useEffect, useState } from "react";

import { useGetUploadedLeaveAttachments } from "~community/common/api/FileHandleApi";
import CheckIcon from "~community/common/assets/Icons/CheckIcon";
import CloseIcon from "~community/common/assets/Icons/CloseIcon";
import CopyIcon from "~community/common/assets/Icons/CopyIcon";
import ReadOnlyChip from "~community/common/components/atoms/Chips/BasicChip/ReadOnlyChip";
import IconChip from "~community/common/components/atoms/Chips/IconChip.tsx/IconChip";
import Avatar from "~community/common/components/molecules/Avatar/Avatar";
import { appModes } from "~community/common/constants/configs";
import { FileTypes } from "~community/common/enums/CommonEnums";
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
    <div>
      <div className="flex flex-row justify-between mb-3">
        <div
          className="flex flex-row items-center gap-3"
          tabIndex={0}
          role="group"
          aria-label={translateAria(["employeeName"], {
            firstName: leaveRequestData?.empName,
            lastName: leaveRequestData?.lastName
          })}
        >
          <div aria-hidden="true">
            <Avatar
              firstName={leaveRequestData?.empName ?? ""}
              lastName={leaveRequestData?.lastName ?? ""}
              src={leaveRequestData.avatarUrl ?? ""}
            />
          </div>
          <span className="text-base" aria-hidden="true">
            {translateText(["employeeName"], {
              employeeName: leaveRequestData?.empName
            }) ?? ""}
          </span>
        </div>
        <div
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
        </div>
      </div>

      <div className="max-h-[50vh] overflow-auto">
        <div className="pt-3 pb-4">
          <div
            className="flex flex-row justify-between items-center pb-4"
            tabIndex={0}
          >
            <span className="text-base">{translateText(["duration"])}:</span>
            <div className="flex flex-row gap-2">
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
            </div>
          </div>
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
              <div className="pt-4 flex flex-col gap-2" tabIndex={0}>
                <p className="text-base">{translateText(["attachments"])}</p>

                <div>
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
                </div>
              </div>
            )}
        </div>
      </div>

      <div className="flex flex-row gap-4 mt-4 justify-end">
        <ButtonV2
          variant={"error"}
          onClick={handleDeclineModel}
          aria-label={translateText(["cancelAreaLabel"])}
          icon={<CloseIcon fill="var(--color-primary-text)" />}
          iconPosition="end"
        >
          {translateText(["declineLeave"])}
        </ButtonV2>
        <ButtonV2
          onClick={handleApprove}
          aria-label={translateText(["approveAreaLabel"])}
          icon={<CheckIcon />}
          iconPosition="end"
        >
          {translateText(["approveLeave"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default ManagerApproveLeaveModal;
