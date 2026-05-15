import { CrmDealSortOrder, CrmDealViewMode } from "../enums/common";
import { CrmModalTypes } from "./ModalTypes";

interface ActionTypes {
  setIsAddCompanyModalOpen: (isAddCompanyModalOpen: boolean) => void;
  setCompanyModalType: (companyModalType: CrmModalTypes) => void;
  setIsAddDealSidePanelOpen: (isOpen: boolean) => void;
  setDealViewMode: (mode: CrmDealViewMode) => void;
  setDealSortOrder: (order: CrmDealSortOrder) => void;
}

export interface CrmStore extends ActionTypes {
  isAddCompanyModalOpen: boolean;
  companyModalType: CrmModalTypes;
  isAddDealSidePanelOpen: boolean;
  dealViewMode: CrmDealViewMode;
  dealSortOrder: CrmDealSortOrder;
}
