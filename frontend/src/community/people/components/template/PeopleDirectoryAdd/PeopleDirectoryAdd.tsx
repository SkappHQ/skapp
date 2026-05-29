import { useRouter } from "next/navigation";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import useStepper from "~community/people/hooks/useStepper";

import DirectoryAddSectionWrapper from "../../organisms/DirectoryAddSectionWrapper/DirectoryAddSectionWrapper";

const PeopleDirectoryAdd = () => {
  const { activeStep, steps } = useStepper();

  const router = useRouter();
  const translatePeople = useTranslator("peopleModule");

  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "commonText"
  );

  return (
    <ContentLayout
      isBackButtonVisible
      isDividerVisible={true}
      breadcrumbs={[
        {
          label: translatePeople(["dashboard.people"])
        },
        {
          label: translatePeople(["peoples.title"]),
          href: ROUTES.PEOPLE.DIRECTORY
        },
        {
          label: translatePeople(["addResource.commonText.addFullProfile"])
        }
      ]}
      title={translateText(["title"])}
      pageHead={translateText(["head"])}
      subtitleNextToTitle={`${activeStep + 1} ${translateText(["of"])} ${steps.length}`}
      onBackClick={() => {
        router.push(ROUTES.PEOPLE.DIRECTORY);
      }}
      containerStyles={{
        overflowY: activeStep === 1 ? "unset" : "auto"
      }}
    >
      <DirectoryAddSectionWrapper />
    </ContentLayout>
  );
};

export default PeopleDirectoryAdd;
