import { useRouter } from "next/router";
import { labelDayButton } from "react-day-picker";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";

import DirectoryEditSectionWrapper from "../../organisms/DirectoryEditSectionWrapper/DirectoryEditSectionWrapper";

const PeopleDirectoryEdit = () => {
  const router = useRouter();
  const { id } = router.query;
  const translateText = useTranslator("peopleModule");
  return (
    <ContentLayout
      breadcrumbs={[
        {
          label: translateText(["dashboard.people"])
        },
        {
          label: translateText(["peoples.title"]),
          href: ROUTES.PEOPLE.DIRECTORY
        },
        {
          label: translateText(["breadcrumbs.editEmployeeProfile"])
        }
      ]}
      pageHead={translateText(["editAllInfo.tabTitle"])}
      title={translateText(["editAllInfo.title"])}
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
