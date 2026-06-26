import { useRouter } from "next/router";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";

import IndividualSectionWrapper from "../../organisms/IndividualSectionWrapper/IndividualSectionWrapper";

const PeopleIndividual = () => {
  const router = useRouter();
  const { id } = router.query;
  return (
    <ContentLayout
      title={""}
      onBackClick={() => router.back()}
      pageHead={""}
      isBackButtonVisible
      isDividerVisible={false}
    >
      <IndividualSectionWrapper employeeId={Number(id)} />
    </ContentLayout>
  );
};

export default PeopleIndividual;
