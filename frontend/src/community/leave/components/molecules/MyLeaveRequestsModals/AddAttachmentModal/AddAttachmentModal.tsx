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
import { MyRequestModalEnums } from "~community/leave/enums/MyRequestEnums";
import { useLeaveStore } from "~community/leave/store/store";

const AddAttachmentModal = () => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "addAttachmentModal"
  );

  const { attachments, setAttachments, setMyLeaveRequestModalType } =
    useLeaveStore();

  const [attachmentError, setAttachmentError] = useState(false);

  const onCancelBtnClick = () => {
    setAttachments([]);
    setMyLeaveRequestModalType(MyRequestModalEnums.APPLY_LEAVE);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className={attachmentError ? "text-red-600" : ""}>
        {translateText(["description"])}
      </p>
      <DragAndDropField
        setAttachmentErrors={(errors: FileRejectionType[]) =>
          setAttachmentError(!!errors.length)
        }
        setAttachments={(attachments: FileUploadType[]) =>
          setAttachments(attachments)
        }
        accept={{
          "image/jpeg": [".jpg", ".jpeg"],
          "image/png": [],
          "application/pdf": [".pdf"]
        }}
        uploadableFiles={attachments}
        maxFileSize={MAX_ALLOWED_UPLOADS}
        supportedFiles={".jpg, .pdf, .png, .jpeg"}
      />
      <div className="flex flex-row gap-3 mt-4 justify-end">
        <ButtonV2
          variant={"tertiary"}
          onClick={onCancelBtnClick}
          icon={<Icon name={IconName.CLOSE_ICON} />}
          iconPosition="end"
        >
          {translateText(["cancelBtn"])}
        </ButtonV2>
        <ButtonV2
          variant={"primary"}
          onClick={() =>
            setMyLeaveRequestModalType(MyRequestModalEnums.APPLY_LEAVE)
          }
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

export default AddAttachmentModal;
