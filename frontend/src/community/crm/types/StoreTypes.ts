import { CrmCompanyTableDataType, CrmCompanyType } from "./CommonTypes";
import { CrmModalTypes } from "./ModalTypes";

interface ActionTypes {
  setIsAddCompanyModalOpen: (isAddCompanyModalOpen: boolean) => void;
  setCompanyModalType: (companyModalType: CrmModalTypes) => void;
}

export interface CrmStore extends ActionTypes {
  isAddCompanyModalOpen: boolean;
  companyModalType: CrmModalTypes;
  isDeleteCompanyModalOpen: boolean;
  setIsDeleteCompanyModalOpen: (isDeleteCompanyModalOpen: boolean) => void;
  selectedCompany: CrmCompanyTableDataType | null;
  setSelectedCompany: (selectedCompany: CrmCompanyTableDataType | null) => void;
  isCompanyDetailDrawerOpen: boolean;
  setIsCompanyDetailDrawerOpen: (isCompanyDetailDrawerOpen: boolean) => void;
}
