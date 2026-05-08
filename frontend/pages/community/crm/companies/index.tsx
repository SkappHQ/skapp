import { Box } from "@mui/material";
import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

const CrmCompanies: NextPage = () => {
  const translateText = useTranslator("crmModule", "companies");

  const onPrimaryButtonClick = () => {
    return
  };

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addCompanyBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      onPrimaryButtonClick={onPrimaryButtonClick}
    >
      <Box>
        Company page contents go here
        {/* CompanyData */}
      </Box>
    </ContentLayout>
  );
};

export default CrmCompanies;
