import { Box, Stack, Typography } from "@mui/material";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { JSX, useEffect, useState } from "react";

import CloseIcon from "~community/common/assets/Icons/CloseIcon";
import Button from "~community/common/components/atoms/Button/Button";
import Checkbox from "~community/common/components/atoms/Checkbox/Checkbox";
import Icon from "~community/common/components/atoms/Icon/Icon";
import ROUTES from "~community/common/constants/routes";
import {
  ButtonStyle,
  ButtonTypes
} from "~community/common/enums/ComponentEnums";
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

  const { data: carryForwardLeaveTypes, isLoading } = useGetLeaveTypes(
    false,
    true
  );

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
    <Stack
      sx={{
        padding: "0rem 0.25rem 1rem 0.25rem",
        minWidth: "31.25rem"
      }}
    >
      <Typography
        variant="body1"
        sx={{
          color: "grey.900",
          width: "100%"
        }}
        id="leave-carry-forward-modal-description"
      >
        {translateTexts(["leaveCarryForwardTypeSelectionModalDescription"]) ??
          ""}
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          flexWrap: "wrap",
          maxHeight: "13.125rem",
          overflowY: "auto",
          marginTop: "0.5rem"
        }}
      >
        {leaveTypess?.length >= 2 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flexBasis: "33.3333%",
              flexWrap: "wrap",
              width: "100%"
            }}
          >
            <Checkbox
              label={translateTexts(["selectAllText"])}
              name={translateTexts(["selectAllText"])}
              checked={checkedList?.length === leaveTypess?.length}
              onChange={handleCheckAll}
            />
          </Box>
        )}
        {leaveTypess?.map((leaveType) => (
          <Box
            key={leaveType.typeId}
            sx={{
              display: "flex",
              flexDirection: "column",
              flexBasis: "33.3333%",
              flexWrap: "wrap",
              width: "100%"
            }}
          >
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
          </Box>
        ))}
      </Box>

      <Box sx={{ mt: "1rem" }}>
        <Button
          label={translateTexts(["leaveCarryForwardModalConfirmBtn"])}
          endIcon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
          type={ButtonTypes.SUBMIT}
          onClick={() => formik.handleSubmit()}
          isLoading={loading}
          disabled={checkedList.length === 0}
          accessibility={{
            ariaHidden: true
          }}
        />
        <Button
          accessibility={{
            ariaHidden: true
          }}
          label={translateTexts(["leaveCarryForwardModalCancelBtn"])}
          endIcon={<CloseIcon />}
          buttonStyle={ButtonStyle.TERTIARY}
          styles={{ mt: "1rem" }}
          disabled={loading}
          type={ButtonTypes.BUTTON}
          onClick={() => {
            setCheckedList([]);
            setCarryForwardLeaveTypes([]);
            setLeaveCarryForwardId([]);
            setLeaveCarryForwardModalType(LeaveCarryForwardModalTypes.NONE);
            handleClose && handleClose();
          }}
        />
      </Box>
    </Stack>
  );
};

export default LeaveCarryForwardTypeContent;
