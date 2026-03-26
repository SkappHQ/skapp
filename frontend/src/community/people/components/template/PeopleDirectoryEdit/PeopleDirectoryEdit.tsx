import { useRouter } from "next/router";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";

import DirectoryEditSectionWrapper from "../../organisms/DirectoryEditSectionWrapper/DirectoryEditSectionWrapper";

const PeopleDirectoryEdit = () => {
  const router = useRouter();
  const { id } = router.query;
  const translateText = useTranslator("peopleModule", "editAllInfo");
  return (
    <ContentLayout
      pageHead={translateText(["tabTitle"])}
      title={translateText(["title"])}
      isBackButtonVisible
      onBackClick={() => router.push(ROUTES.PEOPLE.DIRECTORY)}
      isDividerVisible={false}
      isTitleHidden={true}
    >
      <DirectoryEditSectionWrapper employeeId={Number(id)} />
    </ContentLayout>
  );
};

export default PeopleDirectoryEdit;
