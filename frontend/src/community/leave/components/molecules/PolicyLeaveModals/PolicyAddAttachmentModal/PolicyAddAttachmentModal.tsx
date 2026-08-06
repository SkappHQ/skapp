import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import DragAndDropField from "~community/common/components/molecules/DragAndDropField/DragAndDropField";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  FileRejectionType,
  FileUploadType
} from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { MAX_ALLOWED_UPLOADS } from "~community/leave/constants/stringConstants";
import { PolicyLeaveModalEnums } from "~community/leave/enums/PolicyLeaveEnums";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";

/** Story specifies 10MB per file, above the shared component's 5MB default. */
const MAX_ATTACHMENT_SIZE_BYTES = 10_000_000;

const PolicyAddAttachmentModal = () => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "addAttachmentModal"
  );

  const { attachments, setAttachments, setModalType } = usePolicyLeaveStore();

  const [attachmentError, setAttachmentError] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <p className={attachmentError ? "text-red-600" : ""}>
        {translateText(["description"])}
      </p>
      <DragAndDropField
        setAttachmentErrors={(errors: FileRejectionType[]) =>
          setAttachmentError(!!errors.length)
        }
        setAttachments={(files: FileUploadType[]) => setAttachments(files)}
        accept={{
          "image/jpeg": [".jpg", ".jpeg"],
          "image/png": [],
          "application/pdf": [".pdf"]
        }}
        uploadableFiles={attachments}
        maxFileSize={MAX_ALLOWED_UPLOADS}
        maxSizeOfFile={{
          inBytes: MAX_ATTACHMENT_SIZE_BYTES,
          inReadableSize: "10MB"
        }}
        supportedFiles={".jpg, .pdf, .png, .jpeg"}
      />
      <div className="flex flex-row gap-3 mt-4 justify-end">
        <ButtonV2
          variant={"tertiary"}
          onClick={() => {
            setAttachments([]);
            setModalType(PolicyLeaveModalEnums.APPLY_POLICY_LEAVE);
          }}
          icon={<Icon name={IconName.CLOSE_ICON} />}
          iconPosition="end"
        >
          {translateText(["cancelBtn"])}
        </ButtonV2>
        <ButtonV2
          variant={"primary"}
          onClick={() => setModalType(PolicyLeaveModalEnums.APPLY_POLICY_LEAVE)}
          disabled={attachmentError}
          icon={<Icon name={IconName.TICK_ICON} />}
          iconPosition="end"
        >
          {translateText(["uploadBtn"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default PolicyAddAttachmentModal;
