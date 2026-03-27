import { ButtonV2 } from "@rootcodelabs/skapp-ui";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { LeaveEntitlementModelTypes } from "~community/leave/enums/LeaveEntitlementEnums";
import { useLeaveStore } from "~community/leave/store/store";

const OverrideConfirmation = () => {
  const translateText = useTranslator("leaveModule", "leaveEntitlements");

  const { selectedYear, setLeaveEntitlementModalType } = useLeaveStore(
    (state) => state
  );

  return (
    <div>
      <div id="override-confirmation-modal-title">
        <p className="mb-8">
          {translateText(["overrideConfirmationModalDes"], {
            uploadingYear: selectedYear
          })}
        </p>
        <p className="mb-4">{translateText(["overrideConfirmationTxt"])}</p>
      </div>
      <div className="flex flex-row justify-end gap-3 mt-4">
        <ButtonV2
          variant={"tertiary"}
          onClick={() =>
            setLeaveEntitlementModalType(LeaveEntitlementModelTypes.NONE)
          }
          icon={<Icon name={IconName.CLOSE_ICON} />}
          iconPosition="end"
        >
          {translateText(["cancelBtnTxt"])}
        </ButtonV2>
        <ButtonV2
          variant={"primary"}
          onClick={() =>
            setLeaveEntitlementModalType(
              LeaveEntitlementModelTypes.DOWNLOAD_CSV
            )
          }
          isLoading={false}
          icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
          iconPosition="end"
        >
          {translateText(["proceedBtnTxt"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default OverrideConfirmation;
