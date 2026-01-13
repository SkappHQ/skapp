import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";

import AccountSectionWrapper from "../../organisms/AccountSectionWrapper/AccountSectionWrapper";
import { useAuth } from "~community/auth/providers/AuthProvider";

const PeopleAccount = () => {
  const { user } = useAuth();

  const translateText = useTranslator("peopleModule");

  //  handle go back and route change

  return (
    <ContentLayout
      onBackClick={() => {}}
      pageHead={translateText(["editAllInfo", "tabTitle"])}
      title={""}
    >
      <>
        <AccountSectionWrapper employeeId={Number(user?.userId)} />
      </>
    </ContentLayout>
  );
};

export default PeopleAccount;
