import { SetType } from "~community/common/types/CommonTypes";
import { CrmDealListItem } from "~community/crm/types/CommonTypes";
import { CrmDealSliceTypes } from "~community/crm/types/SliceTypes";
import { mergeDealUpdate } from "~community/crm/utils/crmUtil";

const CrmDealSlice = (
  set: SetType<CrmDealSliceTypes>,
  get: () => CrmDealSliceTypes
) => ({
  selectedDealId: null,
  deals: [],
  setSelectedDealId: (selectedDealId: number | null) => set({ selectedDealId }),
  setDeals: (deals: CrmDealListItem[]) => set({ deals }),
  getDealById: (id: number) => get().deals.find((deal) => deal.id === id),
  updateDeal: (deal: Partial<CrmDealListItem>) =>
    set({ deals: mergeDealUpdate(get().deals, deal) })
});

export default CrmDealSlice;
