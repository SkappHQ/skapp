import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { parse } from "papaparse";
import { FC, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import DragAndDropField from "~community/common/components/molecules/DragAndDropField/DragAndDropField";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { FileUploadType } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { useBulkAssignLeavePolicies } from "~community/leave/api/LeavePolicyAssignmentApi";
import {
  BulkAssignPolicyPayload,
  BulkAssignPolicyResponse
} from "~community/leave/types/LeavePolicyTypes";
import {
  buildBulkAssignPayload,
  getMissingBulkAssignHeaders
} from "~community/leave/utils/bulkAssignPolicyUtils";

interface Props {
  onComplete: (response: BulkAssignPolicyResponse) => void;
  onBack: () => void;
}

const MAX_CSV_FILE_SIZE = { inBytes: 5_000_000, inReadableSize: "5MB" };

const MAX_CSV_ROWS = 1000;

const BulkAssignPolicyUploadStep: FC<Props> = ({ onComplete, onBack }) => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "bulkAssignModal"
  );

  const { setToastMessage } = useToast();

  const [attachment, setAttachment] = useState<FileUploadType[]>([]);
  const [fileError, setFileError] = useState<string>("");
  const [payload, setPayload] = useState<BulkAssignPolicyPayload | null>(null);

  const onSuccess = (response: BulkAssignPolicyResponse): void => {
    const { successCount, failedCount } = response.bulkStatusSummary;

    if (successCount === 0 && failedCount > 0) {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["errorToastTitle"]),
        description: translateText(["errorToastAllFailedDescription"], {
          failedCount
        })
      });
    } else {
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["successToastTitle"]),
        description:
          failedCount === 0
            ? translateText(["successToastAllDescription"], { successCount })
            : translateText(["successToastPartialDescription"], {
                successCount,
                failedCount
              })
      });
    }

    onComplete(response);
  };

  const onError = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["errorToastTitle"]),
      description: translateText(["errorToastDescription"])
    });
  };

  const { mutate, isPending } = useBulkAssignLeavePolicies(onSuccess, onError);

  const handleFile = (files: FileUploadType[]): void => {
    setFileError("");
    setPayload(null);

    const file = files?.[0]?.file;
    if (!file) {
      return;
    }

    parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      complete: (results) => {
        const missingHeaders = getMissingBulkAssignHeaders(
          results.meta.fields ?? []
        );
        if (missingHeaders.length > 0) {
          setFileError(
            translateText(["missingColumnsError"], {
              columns: missingHeaders.join(", ")
            })
          );
          return;
        }
        if (results.errors.length > 0) {
          setFileError(translateText(["malformedRowsError"]));
          return;
        }
        if (results.data.length === 0) {
          setFileError(translateText(["emptyFileError"]));
          return;
        }
        if (results.data.length > MAX_CSV_ROWS) {
          setFileError(
            translateText(["tooManyRowsError"], { maxRows: MAX_CSV_ROWS })
          );
          return;
        }
        setPayload(buildBulkAssignPayload(results.data));
      },
      error: () => setFileError(translateText(["unreadableFileError"]))
    });
  };

  const handleConfirm = (): void => {
    if (payload) {
      mutate(payload);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="body2 text-secondary-text">
        {translateText(["uploadInstruction"])}
      </p>

      <DragAndDropField
        setAttachments={(files: FileUploadType[]) => {
          setAttachment(files);
          handleFile(files);
        }}
        accept={{ "text/csv": [".csv"] }}
        uploadableFiles={attachment}
        supportedFiles=".csv"
        maxFileSize={1}
        maxSizeOfFile={MAX_CSV_FILE_SIZE}
        isZeroFilesErrorRequired={false}
        customError={fileError}
        accessibility={{ componentName: translateText(["title"]) }}
      />

      <div className="flex flex-row justify-end gap-3">
        <ButtonV2
          variant="tertiary"
          onClick={onBack}
          disabled={isPending}
          icon={<Icon name={IconName.LEFT_ARROW_ICON} />}
          iconPosition="start"
        >
          {translateText(["goBackBtnTxt"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          onClick={handleConfirm}
          isLoading={isPending}
          disabled={!payload || isPending}
          icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
          iconPosition="end"
        >
          {translateText(["confirmBtnTxt"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default BulkAssignPolicyUploadStep;
