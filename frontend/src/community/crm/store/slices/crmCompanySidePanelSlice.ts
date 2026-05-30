import { SetType } from "~community/common/types/CommonTypes";
import { CrmCompanySidePanelSliceTypes } from "~community/crm/types/SliceTypes";

const CrmCompanySidePanelSlice = (
  set: SetType<CrmCompanySidePanelSliceTypes>
) => ({
  isCompanySidePanelOpen: false,
  selectedCompanyId: null as number | null,
  setIsCompanySidePanelOpen: (isCompanySidePanelOpen: boolean) =>
    set({ isCompanySidePanelOpen }),
  setSelectedCompanyId: (selectedCompanyId: number | null) =>
    set({ selectedCompanyId })
});

export default CrmCompanySidePanelSlice;
