import { SetType } from "~community/common/types/CommonTypes";
import { CrmCompanyMetricsType } from "~community/crm/types/CommonTypes";
import { CrmCompanyDetailPanelSliceTypes } from "~community/crm/types/SliceTypes";

const CrmCompanyDetailPanelSlice = (
  set: SetType<CrmCompanyDetailPanelSliceTypes>
) => ({
  selectedCompany: null,
  setSelectedCompany: (selectedCompany: CrmCompanyMetricsType | null) =>
    set({ selectedCompany: selectedCompany }),
  isCompanyDetailDrawerOpen: false,
  setIsCompanyDetailDrawerOpen: (isCompanyDetailDrawerOpen: boolean) =>
    set({ isCompanyDetailDrawerOpen: isCompanyDetailDrawerOpen })
});

export default CrmCompanyDetailPanelSlice;
