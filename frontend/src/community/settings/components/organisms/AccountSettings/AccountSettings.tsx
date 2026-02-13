import { JSX } from "react";

import SettingsSection from "~community/common/components/organisms/Settings/Settings";
import SettingsModalController from "~community/common/components/organisms/SettingsModalController/SettingsModalController";

const AccountSettings = (): JSX.Element => {
  return (
    <>
      <SettingsSection />
      <SettingsModalController />
    </>
  );
};

export default AccountSettings;
