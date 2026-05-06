import { type NextPage } from "next";
import { useRouter } from "next/router";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import UpdateWorkLocation from "~community/configurations/components/organisms/UpdateWorkLocation/UpdateWorkLocation";

const WorkLocationEditPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const translateText = useTranslator("configurations", "workLocation");

  const locationId = id ? Number(id) : undefined;

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["form.saveChangesButton"])}
      isDividerVisible
    >
      {locationId !== undefined && <UpdateWorkLocation id={locationId} />}
    </ContentLayout>
  );
};

export default WorkLocationEditPage;
