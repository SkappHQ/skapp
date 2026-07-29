import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { parse } from "papaparse";
import { FC, useState } from "react";

import DragAndDropField from "~community/common/components/molecules/DragAndDropField/DragAndDropField";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  FileRejectionType,
  FileUploadType
} from "~community/common/types/CommonTypes";
import { useBulkAssignLeavePolicies } from "~community/leave/api/LeavePolicyAssignmentApi";
import {
  BulkAssignPolicyPayload,
  BulkAssignPolicyResponse
} from "~community/leave/types/LeavePolicyTypes";
import {
  buildBulkAssignPayload,
  downloadBulkAssignPolicyTemplate,
  getMissingBulkAssignHeaders
} from "~community/leave/utils/bulkAssignPolicyUtils";

interface Props {
  onCancel: () => void;
  onComplete: (response: BulkAssignPolicyResponse) => void;
}

const BulkAssignPolicyUploadStep: FC<Props> = ({ onCancel, onComplete }) => {
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
        if (!results.data || results.data.length === 0) {
          setFileError(translateText(["emptyFileError"]));
          return;
        }
        setPayload(buildBulkAssignPayload(results.data));
      }
    });
  };

  const handleConfirm = (): void => {
    if (payload) {
      mutate(payload);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-secondary-text">
        {translateText(["uploadInstruction"])}
      </p>

      <button
        type="button"
        className="w-fit text-sm font-medium text-blue-600 underline"
        onClick={downloadBulkAssignPolicyTemplate}
        title={translateText(["downloadTemplateTooltip"])}
      >
        {translateText(["downloadTemplateLink"])}
      </button>

      <DragAndDropField
        setAttachments={(files: FileUploadType[]) => {
          setAttachment(files);
          handleFile(files);
        }}
        setAttachmentErrors={(errors: FileRejectionType[]) => {
          if (errors?.length) {
            setFileError(translateText(["invalidFileTypeError"]));
          }
        }}
        accept={{ "text/csv": [".csv"] }}
        uploadableFiles={attachment}
        supportedFiles=".csv"
        maxFileSize={1}
        maxSizeOfFile={{ inBytes: 5000000, inReadableSize: "5MB" }}
        isZeroFilesErrorRequired={false}
        accessibility={{ componentName: translateText(["title"]) }}
      />

      {!!fileError && (
        <div role="alert">
          <p className="mt-1 text-sm text-red-500">{fileError}</p>
        </div>
      )}

      <div className="flex flex-row justify-end gap-3">
        <ButtonV2 variant="tertiary" onClick={onCancel} disabled={isPending}>
          {translateText(["cancelBtnTxt"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          onClick={handleConfirm}
          isLoading={isPending}
          disabled={!payload || isPending}
        >
          {translateText(["confirmBtnTxt"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default BulkAssignPolicyUploadStep;
