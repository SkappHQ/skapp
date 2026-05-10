import { Box } from "@mui/material";
import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import CompanyPopupController from "~community/crm/components/organisms/CompanyPopupController/CompanyPopupController";
import { useCrmStore } from "~community/crm/store/crmStore";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

const CrmCompanies: NextPage = () => {
  const translateText = useTranslator("crmModule", "companies");

  const { setIsAddCompaniesModalOpen, setCompanyModalType } = useCrmStore(
    (store) => ({
      setIsAddCompaniesModalOpen: store.setIsAddCompanyModalOpen,
      setCompanyModalType: store.setCompanyModalType
    })
  );

  const onPrimaryButtonClick = () => {
    setIsAddCompaniesModalOpen(true);
    setCompanyModalType(CrmModalTypes.ADD_COMPANY_MODAL);
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
        <CompanyPopupController />
      </Box>
    </ContentLayout>
  );
};

export default CrmCompanies;
