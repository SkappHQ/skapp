import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { ParseResult, parse } from "papaparse";
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
  CSV_DELIMITER,
  MAX_BULK_ASSIGN_ROWS
} from "~community/leave/constants/leavePolicyConstants";
import useBulkAssignCsvHeaders from "~community/leave/hooks/useBulkAssignCsvHeaders";
import {
  BulkAssignCsvError,
  BulkAssignCsvValidation,
  BulkAssignPolicyPayload,
  BulkAssignPolicyResponse
} from "~community/leave/types/LeavePolicyTypes";
import { validateBulkAssignCsv } from "~community/leave/utils/bulkAssignPolicyUtils";

interface Props {
  onComplete: (assignmentResult: BulkAssignPolicyResponse) => void;
  onBack: () => void;
}

const BulkAssignPolicyUploadStep: FC<Props> = ({ onComplete, onBack }) => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "bulkAssignModal"
  );

  const { setToastMessage } = useToast();

  const csvHeaders = useBulkAssignCsvHeaders();

  const [attachments, setAttachments] = useState<FileUploadType[]>([]);
  const [fileError, setFileError] = useState<string>("");
  const [assignmentPayload, setAssignmentPayload] =
    useState<BulkAssignPolicyPayload | null>(null);

  const showAssignmentResultToast = (
    assignmentResult: BulkAssignPolicyResponse
  ): void => {
    const { successCount, failedCount } = assignmentResult.bulkStatusSummary;

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
  };

  const showRequestFailedToast = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["errorToastTitle"]),
      description: translateText(["errorToastDescription"])
    });
  };

  const { mutate: bulkAssignLeavePolicies, isPending } =
    useBulkAssignLeavePolicies((assignmentResult) => {
      showAssignmentResultToast(assignmentResult);
      onComplete(assignmentResult);
    }, showRequestFailedToast);

  const getValidationErrorText = (
    validation: BulkAssignCsvValidation
  ): string => {
    switch (validation.error) {
      case BulkAssignCsvError.MISSING_COLUMNS:
        return translateText(["missingColumnsError"], {
          columns: validation.missingColumns.join(CSV_DELIMITER)
        });
      case BulkAssignCsvError.MALFORMED_ROWS:
        return translateText(["malformedRowsError"]);
      case BulkAssignCsvError.EMPTY_FILE:
        return translateText(["emptyFileError"]);
      case BulkAssignCsvError.TOO_MANY_ROWS:
        return translateText(["tooManyRowsError"], {
          maxRows: MAX_BULK_ASSIGN_ROWS.toString()
        });
      default:
        return "";
    }
  };

  const handleParseComplete = (
    parseResult: ParseResult<Record<string, string>>
  ): void => {
    const validation = validateBulkAssignCsv(parseResult, csvHeaders);

    setFileError(getValidationErrorText(validation));
    setAssignmentPayload(validation.payload);
  };

  const handleFileSelection = (selectedFiles: FileUploadType[]): void => {
    setFileError("");
    setAssignmentPayload(null);

    const file = selectedFiles?.[0]?.file;
    if (!file) {
      return;
    }

    parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      complete: handleParseComplete,
      error: () => setFileError(translateText(["unreadableFileError"]))
    });
  };

  const handleConfirm = (): void => {
    if (!assignmentPayload) {
      return;
    }

    bulkAssignLeavePolicies(assignmentPayload);
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="body2 text-secondary-text">
        {translateText(["uploadInstruction"])}
      </p>

      <DragAndDropField
        setAttachments={(selectedFiles: FileUploadType[]) => {
          setAttachments(selectedFiles);
          handleFileSelection(selectedFiles);
        }}
        accept={{ "text/csv": [".csv"] }}
        uploadableFiles={attachments}
        supportedFiles=".csv"
        maxFileSize={1}
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
          disabled={!assignmentPayload || isPending}
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
