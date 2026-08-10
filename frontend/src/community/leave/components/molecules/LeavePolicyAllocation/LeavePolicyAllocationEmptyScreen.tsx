import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

const LeavePolicyAllocationEmptyScreen = () => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "leavePolicyAllocation",
    "emptyScreen"
  );

  return (
    <div className="w-full">
      <div className="flex min-h-[24.4375rem] flex-col items-center justify-center">
        <div className="flex w-full max-w-[30.75rem] flex-col items-center justify-center gap-4 text-center">
          <Icon name={IconName.CALENDAR_ICON} />
          <p className="text-lg font-bold">{translateText(["title"])}</p>
          <div className="body2 w-full text-black">
            {translateText(["description"])}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeavePolicyAllocationEmptyScreen;
