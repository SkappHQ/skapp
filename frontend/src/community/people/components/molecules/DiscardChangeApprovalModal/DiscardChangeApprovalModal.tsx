import { Box, Divider, type Theme, Typography, useTheme } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { DiscardTypeEnums } from "~community/people/enums/DirectoryEnums";
import {
  DiscardChangeModalType,
  EditAllInformationFormStatus,
  EditAllInformationType
} from "~community/people/types/EditEmployeeInfoTypes";

interface Props {
  setFormType?: Dispatch<SetStateAction<EditAllInformationType>>;
  isDiscardChangesModal: DiscardChangeModalType;
  setIsDiscardChangesModal: Dispatch<SetStateAction<DiscardChangeModalType>>;
  functionOnLeave: () => void;
  updateEmployeeStatus?: EditAllInformationFormStatus;
  setUpdateEmployeeStatus?: Dispatch<
    SetStateAction<EditAllInformationFormStatus>
  >;
}

const DiscardChangeApprovalModal = ({
  setFormType,
  setIsDiscardChangesModal,
  isDiscardChangesModal,
  functionOnLeave,
  updateEmployeeStatus,
  setUpdateEmployeeStatus
}: Props) => {
  const router = useRouter();
  const theme: Theme = useTheme();
  const translateText = useTranslator("peopleModule", "discardChangesModal");

  const handleSaveChanges = async () => {
    if (!isDiscardChangesModal?.isModalOpen) return;
    if (isDiscardChangesModal?.modalType === DiscardTypeEnums.LEAVE_TAB) {
      if (updateEmployeeStatus === EditAllInformationFormStatus.PENDING) {
        setUpdateEmployeeStatus?.(EditAllInformationFormStatus.TRIGGERED);
        return;
      }
      if (
        updateEmployeeStatus === EditAllInformationFormStatus.VALIDATE_ERROR
      ) {
        handleClose();
        return;
      }
      if (updateEmployeeStatus === EditAllInformationFormStatus.VALIDATED) {
        switch (isDiscardChangesModal?.modalOpenedFrom) {
          case EditAllInformationType.personal:
            setFormType?.(EditAllInformationType.personal);
            break;
          case EditAllInformationType.emergency:
            setFormType?.(EditAllInformationType.emergency);
            break;
          case EditAllInformationType.employment:
            setFormType?.(EditAllInformationType.employment);
            break;
          case EditAllInformationType.timeline:
            setFormType?.(EditAllInformationType.timeline);
            break;
          case EditAllInformationType.leave:
            setFormType?.(EditAllInformationType.leave);
            break;
          case EditAllInformationType.timesheeet:
            setFormType?.(EditAllInformationType.timesheeet);
            break;
          default:
            setFormType?.(EditAllInformationType.personal);
            break;
        }
      }
      if (
        updateEmployeeStatus === EditAllInformationFormStatus.UPDATE_ERROR ||
        updateEmployeeStatus === EditAllInformationFormStatus.UPDATED
      ) {
        handleClose();
        return;
      }
    }
    if (isDiscardChangesModal?.modalType === DiscardTypeEnums.LEAVE_FORM) {
      if (updateEmployeeStatus === EditAllInformationFormStatus.PENDING) {
        setUpdateEmployeeStatus?.(EditAllInformationFormStatus.TRIGGERED);
        return;
      }
      if (
        updateEmployeeStatus === EditAllInformationFormStatus.VALIDATE_ERROR
      ) {
        handleClose();
        return;
      }
      if (
        updateEmployeeStatus === EditAllInformationFormStatus.UPDATE_ERROR ||
        updateEmployeeStatus === EditAllInformationFormStatus.UPDATED
      ) {
        handleClose();
        await router.back();
      }
    }
    if (
      isDiscardChangesModal?.modalType === DiscardTypeEnums.CANCEL_FORM ||
      isDiscardChangesModal?.modalType === DiscardTypeEnums.DISCARD_FORM
    ) {
      functionOnLeave();
      handleClose();
    }
  };

  const handleDiscard = async () => {
    if (isDiscardChangesModal?.modalType === DiscardTypeEnums.LEAVE_TAB) {
      switch (isDiscardChangesModal?.modalOpenedFrom) {
        case EditAllInformationType.personal:
          setFormType?.(EditAllInformationType.personal);
          break;
        case EditAllInformationType.emergency:
          setFormType?.(EditAllInformationType.emergency);
          break;
        case EditAllInformationType.employment:
          setFormType?.(EditAllInformationType.employment);
          break;
        case EditAllInformationType.timeline:
          setFormType?.(EditAllInformationType.timeline);
          break;
        case EditAllInformationType.leave:
          setFormType?.(EditAllInformationType.leave);
          break;
        case EditAllInformationType.timesheeet:
          setFormType?.(EditAllInformationType.timesheeet);
          break;
        default:
          setFormType?.(EditAllInformationType.personal);
          break;
      }
      handleClose();
      functionOnLeave();
    }
    if (isDiscardChangesModal?.modalType === DiscardTypeEnums.LEAVE_FORM) {
      await router.back();
    }
    if (
      isDiscardChangesModal?.modalType === DiscardTypeEnums.CANCEL_FORM ||
      isDiscardChangesModal?.modalType === DiscardTypeEnums.DISCARD_FORM
    ) {
      handleClose();
    }
  };

  const handleClose = () => {
    setUpdateEmployeeStatus?.(EditAllInformationFormStatus.PENDING);
    setIsDiscardChangesModal({
      isModalOpen: false,
      modalType: "",
      modalOpenedFrom: ""
    });
  };

  useEffect(() => {
    if (
      typeof updateEmployeeStatus !== "undefined" &&
      updateEmployeeStatus !== EditAllInformationFormStatus.PENDING
    ) {
      void handleSaveChanges();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateEmployeeStatus]);

  return (
    <Box
      sx={{
        diplay: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.notifyBadge.contrastText,
        width: "31.25rem",
        padding: "2.125rem 1.25rem 1.5rem 1.25rem",
        borderRadius: "1.5rem"
      }}
    >
      <Box
        component="div"
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.375rem"
        }}
      >
        <Typography
          component="div"
          sx={{
            fontWeight: "700",
            fontSize: "1.5rem",
            lineHeight: "1.5rem",
            color: "common.black",
            mt: "1rem"
          }}
        >
          {translateText(["title"])}
        </Typography>
      </Box>
      <Divider sx={{ my: "0.75rem" }} />
      <Box>
        <Typography
          component="div"
          sx={{
            fontWeight: "400",
            fontSize: "1rem",
            color: "common.black",
            textAlign: "left",
            lineHeight: "1.5rem"
          }}
        >
          {isDiscardChangesModal.modalType === DiscardTypeEnums.LEAVE_TAB ||
          isDiscardChangesModal.modalType === DiscardTypeEnums.LEAVE_FORM
            ? translateText(["leaveTabDescription"])
            : isDiscardChangesModal.modalType === DiscardTypeEnums.CANCEL_FORM
              ? translateText(["cancelFormDescription"])
              : translateText(["discardFormDescription"])}
        </Typography>
        <ButtonV2
          variant={"primary"}
          isFullWidth={true}
          onClick={handleSaveChanges}
          isLoading={
            typeof updateEmployeeStatus !== "undefined" &&
            updateEmployeeStatus !== EditAllInformationFormStatus.PENDING
          }
          disabled={
            typeof updateEmployeeStatus !== "undefined" &&
            updateEmployeeStatus !== EditAllInformationFormStatus.PENDING
          }
          icon={<Icon name={IconName.RIGHT_MARK} />}
          iconPosition="end"
        >
          {isDiscardChangesModal.modalType === DiscardTypeEnums.LEAVE_TAB ||
          isDiscardChangesModal.modalType === DiscardTypeEnums.LEAVE_FORM
            ? translateText(["saveChanges"])
            : translateText(["confirm"])}
        </ButtonV2>
        <ButtonV2
          variant={"tertiary"}
          isFullWidth={true}
          onClick={handleDiscard}
          icon={<Icon name={IconName.CLOSE_ICON} />}
          iconPosition="end"
        >
          {isDiscardChangesModal.modalType === DiscardTypeEnums.LEAVE_TAB ||
          isDiscardChangesModal.modalType === DiscardTypeEnums.LEAVE_FORM
            ? translateText(["discard"])
            : translateText(["cancel"])}
        </ButtonV2>
      </Box>
    </Box>
  );
};

export default DiscardChangeApprovalModal;
