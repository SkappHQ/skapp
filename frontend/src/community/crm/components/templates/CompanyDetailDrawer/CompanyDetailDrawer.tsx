import { Box, Drawer } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";

import ModalController from "~community/common/components/organisms/ModalController/ModalController";
import DeleteCompanyConfirmationModal from "~community/crm/components/molecules/DeleteCompanyConfirmationModal/DeleteCompanyConfirmationModal";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

import CompanyDetailHeader from "../../molecules/CompanyDetailHeader/CompanyDetailHeader";
import CompanyMetricCards from "../../molecules/CompanyMetricCards/CompanyMetricCards";

const CompanyDetailDrawer: React.FC = () => {
  const theme = useTheme();
  const { isCompanyDetailDrawerOpen, selectedCompany, companyModalType, setIsCompanyDetailDrawerOpen, setSelectedCompany, setCompanyModalType } =
    useCrmStore();

  const handleClose = () => {
    setIsCompanyDetailDrawerOpen(false);
    setSelectedCompany(null);
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={isCompanyDetailDrawerOpen}
        onClose={handleClose}
        sx={{
          "& .MuiDrawer-paper": {
            width: "calc(100vw - 507px)",
            maxWidth: "100%",
            borderRadius: "0.75rem 0 0 0.75rem",
            boxShadow: theme.shadows[8]
          }
        }}
      >
        <Box
          sx={{
            height: "100%",
            overflowY: "auto",
            padding: "1.5rem"
          }}
        >
          {selectedCompany && (
            <CompanyDetailHeader
              company={selectedCompany}
              onClose={handleClose}
            />
          )}
          {selectedCompany && (
            <CompanyMetricCards metrics={[]} />
          )}
        </Box>
      </Drawer>

      <ModalController
        isModalOpen={
          companyModalType === CrmModalTypes.DELETE_COMPANY_CONFIRMATION
        }
        handleCloseModal={() => setCompanyModalType(CrmModalTypes.NONE)}
        modalTitle="Are you sure?"
        isDividerVisible={false}
      >
        <DeleteCompanyConfirmationModal />
      </ModalController>
    </>
  );
};

export default CompanyDetailDrawer;
