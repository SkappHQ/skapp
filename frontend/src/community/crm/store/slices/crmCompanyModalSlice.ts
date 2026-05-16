import { SetType } from "~community/common/types/CommonTypes";
import { CrmCompanyType } from "~community/crm/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmCompanyModalSliceTypes } from "~community/crm/types/SliceTypes";

const CrmCompanyModalSlice = (set: SetType<CrmCompanyModalSliceTypes>) => ({
  isAddCompanyModalOpen: false,
  companyModalType: CrmModalTypes.NONE,
  isCompanyDetailDrawerOpen: false,
  selectedCompany: null as CrmCompanyType | null,
  setIsAddCompanyModalOpen: (isAddCompanyModalOpen: boolean) =>
    set({ isAddCompanyModalOpen: isAddCompanyModalOpen }),
  setCompanyModalType: (companyModalType: CrmModalTypes) =>
    set({ companyModalType: companyModalType }),
  setIsCompanyDetailDrawerOpen: (isOpen: boolean) =>
    set({ isCompanyDetailDrawerOpen: isOpen }),
  setSelectedCompany: (company: CrmCompanyType | null) =>
    set({ selectedCompany: company })
});

export default CrmCompanyModalSlice;
