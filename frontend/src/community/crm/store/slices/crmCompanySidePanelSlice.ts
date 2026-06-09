import { SetType } from "~community/common/types/CommonTypes";
import { CrmCompanyMetricsType } from "~community/crm/types/CommonTypes";
import { CrmCompanySidePanelSliceTypes } from "~community/crm/types/SliceTypes";

const CrmCompanySidePanelSlice = (
  set: SetType<CrmCompanySidePanelSliceTypes>
) => ({
  isCompanySidePanelOpen: false,
  setIsCompanySidePanelOpen: (isCompanySidePanelOpen: boolean) =>
    set({ isCompanySidePanelOpen }),
  selectedCompany: null,
  setSelectedCompany: (selectedCompany: CrmCompanyMetricsType | null) =>
    set({ selectedCompany })
});

export default CrmCompanySidePanelSlice;
