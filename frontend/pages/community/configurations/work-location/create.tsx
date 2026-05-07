import { type NextPage } from "next";
import { useRouter } from "next/router";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import CreateWorkLocation from "~community/common/components/organisms/CreateWorkLocation/CreateWorkLocation";

const WorkLocationCreatePage: NextPage = () => {
  const router = useRouter();
  const translateText = useTranslator("configurations", "workLocation");

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["form.addLocationButton"])}
      isDividerVisible
      isBackButtonVisible
      onBackClick={() => router.back()}
    >
      <CreateWorkLocation />
    </ContentLayout>
  );
};

export default WorkLocationCreatePage;
