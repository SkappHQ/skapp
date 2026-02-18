import { type NextPage } from "next";

import SettingsSection from "~community/common/components/organisms/Settings/Settings";
import SettingsModalController from "~community/common/components/organisms/SettingsModalController/SettingsModalController";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";

const Account: NextPage = () => {
  const translateText = useTranslator("settings");

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      isDividerVisible={true}
    >
      <>
        <SettingsSection />
        <SettingsModalController />
      </>
    </ContentLayout>
  );
};

export default Account;
