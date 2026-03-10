import { Box, Divider, Stack, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import React, { useCallback, useState } from "react";

import { Button } from "@rootcodelabs/skapp-ui";
import Icon from "~community/common/components/atoms/Icon/Icon";
import Modal from "~community/common/components/organisms/Modal/Modal";
import { AccountSignIn } from "~community/common/constants/stringConstants";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import {
  useGetEmployeeById,
  useResetSharePassword,
  useSharePassword
} from "~community/people/api/PeopleApi";
import { usePeopleStore } from "~community/people/store/store";
import { QuickAddEmployeeResponse } from "~community/people/types/EmployeeTypes";

import LoginCredentialsModal from "../../molecules/LoginCredentialsModal/LoginCredentialsModal";
import styles from "./styles";

const SystemCredentials: React.FC = () => {
  const translatedTexts = useTranslator("peopleModule", "peoples");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [resetPasswordData, setResetPasswordData] =
    useState<QuickAddEmployeeResponse | null>(null);
  const { toastMessage, setToastMessage } = useToast();

  const translateText = useTranslator("peopleModule", "systemCredentials");

  const classes = styles();

  const { id } = useParams<{ id: string }>();
  const employeeId = Number(id);
  const { data: employeeData } = useGetEmployeeById(employeeId);

  const isFirstPasswordChange =
    employeeData?.accountStatus !== AccountSignIn.PENDING;

  const setSharedCredentialData = usePeopleStore(
    (state) => state.setSharedCredentialData
  );

  const { data: sharedPasswordData } = useSharePassword(employeeId);
  const { mutateAsync: resetPassword } = useResetSharePassword();

  const handleShareCredentials = useCallback(async () => {
    try {
      setIsLoading(true);
      setSharedCredentialData({
        firstName: sharedPasswordData?.firstName ?? "",
        lastName: sharedPasswordData?.lastName ?? "",
        employeeCredentials: {
          email: sharedPasswordData?.employeeCredentials.email ?? "",
          tempPassword:
            sharedPasswordData?.employeeCredentials.tempPassword ?? ""
        }
      });

      setShowModal(true);
    } catch (error) {
      setToastMessage({
        open: true,
        toastType: "error",
        title: translateText(["resetPasswordFailedTitle"]),
        isIcon: true
      });
    } finally {
      setIsLoading(false);
    }
  }, [sharedPasswordData, setSharedCredentialData]);

  const handleResetPassword = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await resetPassword(employeeId as number);
      const { firstName, lastName, employeeCredentials } = response[0] || {};
      const { email = "", tempPassword = "" } = employeeCredentials || {};

      const resetData = {
        firstName,
        lastName,
        employeeCredentials: {
          email,
          tempPassword
        }
      };

      setSharedCredentialData({
        firstName,
        lastName,
        employeeCredentials: {
          email,
          tempPassword
        }
      });
      setResetPasswordData(resetData);
      setShowModal(true);
      setToastMessage({
        open: true,
        toastType: "success",
        title: translateText(["resetPasswordTitle"]),
        description: translateText(["resetPasswordDescription"]),
        isIcon: true
      });
    } catch (error) {
      setToastMessage({
        open: true,
        toastType: "error",
        title: translateText(["resetPasswordFailedTitle"]),
        description: translateText(["resetPasswordFailedDescription"]),
        isIcon: true
      });
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, resetPassword, setSharedCredentialData]);

  const handleCloseModal = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, reason: string) => {
      setShowModal(false);
      if (isFirstPasswordChange) {
        setResetPasswordData(null);
      }
    },
    [isFirstPasswordChange]
  );

  const modalData = isFirstPasswordChange
    ? resetPasswordData
    : sharedPasswordData;

  return (
    <Box mt="1.75rem">
      <Typography variant="h1">
        {translateText(["systemCredentialsHeading"])}
      </Typography>
      <Stack sx={classes.dividerWrapper}>
        <Divider />
      </Stack>
      {isFirstPasswordChange ? (
        <Button variant={"tertiary"} onClick={handleResetPassword} isLoading={isLoading} fullWidth={false} icon={<Icon name={IconName.LOCK_ICON} />} iconPosition="start">{translateText(["resetPasswordBtn"])}</Button>
      ) : (
        <Button variant={"tertiary"} onClick={handleShareCredentials} isLoading={isLoading} fullWidth={false} icon={<Icon name={IconName.SHARE_ICON} />} iconPosition="start">{translateText(["shareCredentialsBtn"])}</Button>
      )}

      {modalData && (
        <Modal
          isModalOpen={showModal}
          onCloseModal={handleCloseModal}
          title={translatedTexts(["shareCredentials"])}
          isClosable={true}
          isDividerVisible={true}
          isIconVisible={true}
        >
          <LoginCredentialsModal />
        </Modal>
      )}
    </Box>
  );
};

export default SystemCredentials;
