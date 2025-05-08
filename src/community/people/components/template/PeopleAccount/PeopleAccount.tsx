import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useAppSession } from "~community/common/providers/SessionProvider";

import AccountSectionWrapper from "../../organisms/AccountSectionWrapper/AccountSectionWrapper";

const PeopleAccount = () => {
  const { data } = useAppSession();

  const translateText = useTranslator("peopleModule");

  //  handle go back and route change

  return (
    <ContentLayout
      onBackClick={() => {}}
      pageHead={translateText(["editAllInfo", "tabTitle"])}
      title={""}
    >
      <>
        <AccountSectionWrapper employeeId={Number(data?.user.userId)} />
      </>
    </ContentLayout>
  );
};

export default PeopleAccount;
