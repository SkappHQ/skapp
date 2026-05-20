import { type NextPage } from "next";
import { useRouter } from "next/router";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import WorkLocationForm from "~community/configurations/components/organisms/WorkLocationForm/WorkLocationForm";
import { useWorkLocationStore } from "~community/configurations/stores/workLocationStore";

const WorkLocationCreatePage: NextPage = () => {
  const router = useRouter();
  const translateText = useTranslator("configurations", "workLocation");
  const { isFormDirty, setIsUnsavedModalOpen } = useWorkLocationStore();

  const handleBackClick = () => {
    if (isFormDirty) {
      setIsUnsavedModalOpen(true);
    } else {
      router.push(`${ROUTES.CONFIGURATIONS.BASE}?tab=organization`);
    }
  };

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["form.addLocationButton"])}
      isDividerVisible
      isBackButtonVisible
      onBackClick={handleBackClick}
    >
      <WorkLocationForm />
    </ContentLayout>
  );
};

export default WorkLocationCreatePage;
