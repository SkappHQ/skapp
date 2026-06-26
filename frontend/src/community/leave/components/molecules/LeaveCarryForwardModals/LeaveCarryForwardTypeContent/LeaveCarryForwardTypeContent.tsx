import { ArrowRightIcon, ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { JSX, useEffect, useState } from "react";

import CloseIcon from "~community/common/assets/Icons/CloseIcon";
import Checkbox from "~community/common/components/atoms/Checkbox/Checkbox";
import Icon from "~community/common/components/atoms/Icon/Icon";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { getEmoji } from "~community/common/utils/commonUtil";
import {
  useGetLeaveTypes,
  useGetUseCarryForwardLeaveEntitlements
} from "~community/leave/api/LeaveApi";
import { useLeaveStore } from "~community/leave/store/store";
import { LeaveTypeType } from "~community/leave/types/AddLeaveTypes";
import { LeaveCarryForwardModalTypes } from "~community/leave/types/LeaveCarryForwardTypes";
import { getTruncatedLabel } from "~community/leave/utils/leaveTypes/LeaveTypeUtils";

interface Props {
  handleClose?: () => void;
}

const LeaveCarryForwardTypeContent = ({ handleClose }: Props): JSX.Element => {
  const [checkedList, setCheckedList] = useState<number[]>([]);
  const [leaveTypess, setLeaveTypess] = useState<LeaveTypeType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const {
    leaveTypes,
    setLeaveCarryForwardModalType,
    setLeaveCarryForwardId,
    setCarryForwardLeaveTypes
  } = useLeaveStore((state) => state);

  const { data: carryForwardLeaveTypes, isLoading } = useGetLeaveTypes({
    filterByInUse: false,
    isCarryForward: true
  });

  const translateTexts = useTranslator("leaveModule", "leaveCarryForward");
  const router = useRouter();

  const {
    data: carryForwardEntitlement,
    isLoading: carryForwardLeaveEntitlementLoading,
    isRefetching,
    refetch
  } = useGetUseCarryForwardLeaveEntitlements(checkedList);

  const handleCheck = (id: number) => {
    setCheckedList((prevCheckedList) =>
      prevCheckedList.includes(id)
        ? prevCheckedList.filter((item) => item !== id)
        : [...prevCheckedList, id]
    );
  };

  const handleCheckAll = () => {
    const allSelected = checkedList.length === leaveTypess.length;
    setCheckedList(allSelected ? [] : leaveTypess.map((leave) => leave.typeId));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setIsSubmitted(true);
    await refetch();
  };

  const formik = useFormik({
    initialValues: {
      leaveTypes: leaveTypes?.reduce(
        (acc, leaveType) => {
          acc[leaveType.typeId] = false;
          return acc;
        },
        {} as { [key: number]: boolean }
      )
    },
    onSubmit: handleSubmit
  });

  useEffect(() => {
    if (carryForwardLeaveTypes && !isLoading) {
      setLeaveTypess(carryForwardLeaveTypes);
    }
  }, [carryForwardLeaveTypes, isLoading]);

  useEffect(() => {
    const handleCarryForwardEntitlments = async () => {
      if (checkedList.length > 0 && carryForwardEntitlement?.items) {
        setLoading(false);
        if (carryForwardEntitlement.items.length > 0) {
          setLeaveCarryForwardId(checkedList);
          const carryForwardTypesByCheckList = leaveTypess.filter((leaveType) =>
            checkedList.includes(leaveType.typeId)
          );

          setCarryForwardLeaveTypes(carryForwardTypesByCheckList);

          await router.push(ROUTES.LEAVE.CARRY_FORWARD);
          handleClose && handleClose();
        } else if (carryForwardEntitlement.items.length === 0) {
          setLeaveCarryForwardModalType(
            LeaveCarryForwardModalTypes.CARRY_FORWARD_INELIGIBLE
          );
        }
      }
    };

    if (
      isSubmitted &&
      !carryForwardLeaveEntitlementLoading &&
      !isRefetching &&
      carryForwardEntitlement?.items
    ) {
      void handleCarryForwardEntitlments();
      setIsSubmitted(false);
    }
  }, [
    carryForwardEntitlement,
    isRefetching,
    carryForwardLeaveEntitlementLoading,
    checkedList,
    leaveTypess,
    loading,
    isSubmitted
  ]);

  return (
    <div className="px-1 pb-4">
      <p
        className="text-gray-900 w-full"
        id="leave-carry-forward-modal-description"
      >
        {translateTexts(["leaveCarryForwardTypeSelectionModalDescription"]) ??
          ""}
      </p>

      <div className="grid grid-cols-3 w-full max-h-[13.125rem] overflow-y-auto mt-2">
        {leaveTypess?.length >= 2 && (
          <div>
            <Checkbox
              label={translateTexts(["selectAllText"])}
              name={translateTexts(["selectAllText"])}
              checked={checkedList?.length === leaveTypess?.length}
              onChange={handleCheckAll}
            />
          </div>
        )}
        {leaveTypess?.map((leaveType) => (
          <div key={leaveType.typeId}>
            <Checkbox
              label={
                <span aria-label={leaveType.name}>
                  <span role="img" aria-hidden="true">
                    {getEmoji(leaveType?.emojiCode || "")}
                  </span>{" "}
                  {getTruncatedLabel(leaveType?.name as string)}
                </span>
              }
              name={`leaveTypes[${leaveType.typeId}]`}
              checked={checkedList?.includes(leaveType.typeId)}
              onChange={() => handleCheck(leaveType.typeId)}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-row justify-end gap-3 mt-4">
        <ButtonV2
          variant={"tertiary"}
          disabled={loading}
          type={"button"}
          onClick={() => {
            setCheckedList([]);
            setCarryForwardLeaveTypes([]);
            setLeaveCarryForwardId([]);
            setLeaveCarryForwardModalType(LeaveCarryForwardModalTypes.NONE);
            handleClose && handleClose();
          }}
          icon={<CloseIcon />}
          iconPosition="end"
        >
          {translateTexts(["leaveCarryForwardModalCancelBtn"])}
        </ButtonV2>
        <ButtonV2
          type={"submit"}
          onClick={() => formik.handleSubmit()}
          isLoading={loading}
          disabled={checkedList.length === 0}
          icon={<ArrowRightIcon />}
          iconPosition="end"
        >
          {translateTexts(["leaveCarryForwardModalConfirmBtn"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default LeaveCarryForwardTypeContent;
