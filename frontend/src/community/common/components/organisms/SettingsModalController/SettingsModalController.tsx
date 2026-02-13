import { Box } from "@mui/material";
import { JSX, memo } from "react";

import { useCommonStore } from "~community/common/stores/commonStore";
import { SettingsModalTypes } from "~community/common/types/SettingsTypes";

import ResetPasswordModal from "../../molecules/ResetPasswordModal/ResetPasswordModal";
import SetupEmailServerModal from "../../molecules/SetupEmailServerModal/SetupEmailServerModal";
import TestEmailServerModal from "../../molecules/TestEmailServerModal/TestEmailServerModal";

const SettingsModalController = (): JSX.Element => {
  const { modalType, isModalOpen, setModalOpen } = useCommonStore(
    (state) => state
  );

  const modalRender = (): JSX.Element => {
    switch (modalType) {
      case SettingsModalTypes.SETUP_EMAIL_SERVER:
        return (
          <SetupEmailServerModal
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
          />
        );
      case SettingsModalTypes.TEST_EMAIL_SERVER:
        return (
          <TestEmailServerModal
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
          />
        );
      case SettingsModalTypes.RESET_PASSWORD:
        return (
          <ResetPasswordModal
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
          />
        );
      default:
        return <></>;
    }
  };

  return <Box>{modalRender()}</Box>;
};

export default memo(SettingsModalController);
