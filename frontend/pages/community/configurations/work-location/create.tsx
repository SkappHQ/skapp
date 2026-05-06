import { type NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import CreateWorkLocation from "~community/common/components/organisms/CreateWorkLocation/CreateWorkLocation";

const WorkLocationCreatePage: NextPage = () => {
  const translateText = useTranslator("configurations", "workLocation");

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["form.addLocationButton"])}
      isDividerVisible
    >
      <CreateWorkLocation />
    </ContentLayout>
  );
};

export default WorkLocationCreatePage;
