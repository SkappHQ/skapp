import { CrmCompanyMetricsType } from "./CommonTypes";
import { CrmDealType } from "./CommonTypes";
import { CrmDealModalTypes, CrmModalTypes } from "./ModalTypes";

interface ActionTypes {
  setIsCompanyModalOpen: (isCompanyModalOpen: boolean) => void;
  setCompanyModalType: (companyModalType: CrmModalTypes) => void;
  setSelectedCompany: (selectedCompany: CrmCompanyMetricsType | null) => void;
  setIsCompanyDetailDrawerOpen: (isCompanyDetailDrawerOpen: boolean) => void;
  setIsAddDealFormOpen: (isAddDealFormOpen: boolean) => void;
  setIsDealModalOpen: (isDealModalOpen: boolean) => void;
  setDealModalType: (dealModalType: CrmDealModalTypes) => void;
  setCurrentDeletingDeal: (currentDeletingDeal: CrmDealType | null) => void;
}

export interface CrmStore extends ActionTypes {
  isCompanyModalOpen: boolean;
  companyModalType: CrmModalTypes;
  selectedCompany: CrmCompanyMetricsType | null;
  isCompanyDetailDrawerOpen: boolean;
  isAddDealFormOpen: boolean;
  isDealModalOpen: boolean;
  dealModalType: CrmDealModalTypes;
  currentDeletingDeal: CrmDealType | null;
}
