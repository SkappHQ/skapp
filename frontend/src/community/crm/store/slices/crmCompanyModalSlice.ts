import { SetType } from "~community/common/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmCompanyModalSliceTypes } from "~community/crm/types/SliceTypes";
import { CrmCompanyMetricsType } from "~community/crm/types/CommonTypes";

const CrmCompanyModalSlice = (set: SetType<CrmCompanyModalSliceTypes>) => ({
  companyModalType: CrmModalTypes.NONE,
  selectedCompany: null as CrmCompanyMetricsType | null,
  isCompanyModalOpen: false,
  setCompanyModalType: (companyModalType: CrmModalTypes) =>
    set({ companyModalType: companyModalType }),
  setSelectedCompany: (selectedCompany: CrmCompanyMetricsType | null) =>
    set({ selectedCompany: selectedCompany }),
  setIsCompanyModalOpen: (isCompanyModalOpen: boolean) =>
    set({ isCompanyModalOpen: isCompanyModalOpen })
});

export default CrmCompanyModalSlice;
