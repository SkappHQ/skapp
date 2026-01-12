import { useRouter } from "next/router";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";

import DirectoryEditSectionWrapper from "../../organisms/DirectoryEditSectionWrapper/DirectoryEditSectionWrapper";
import ROUTES from "~community/common/constants/routes";

const PeopleDirectoryEdit = () => {
  const router = useRouter();
  const { id } = router.query;
  return (
    <ContentLayout
      pageHead={""}
      title={""}
      isBackButtonVisible
      onBackClick={() => router.push(ROUTES.PEOPLE.DIRECTORY)}
      isDividerVisible={false}
    >
      <DirectoryEditSectionWrapper employeeId={Number(id)} />
    </ContentLayout>
  );
};

export default PeopleDirectoryEdit;
