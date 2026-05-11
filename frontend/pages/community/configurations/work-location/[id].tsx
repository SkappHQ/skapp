import { type NextPage } from "next";
import { useRouter } from "next/router";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import WorkLocationForm from "~community/configurations/components/organisms/WorkLocationForm/WorkLocationForm";

const WorkLocationEditPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const translateText = useTranslator("configurations", "workLocation");

  const locationId = id ? Number(id) : undefined;

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["form.editLocationTitle"])}
      isDividerVisible
      isBackButtonVisible
      onBackClick={() => router.back()}
    >
      {locationId !== undefined && <WorkLocationForm id={locationId} />}
    </ContentLayout>
  );
};

export default WorkLocationEditPage;
