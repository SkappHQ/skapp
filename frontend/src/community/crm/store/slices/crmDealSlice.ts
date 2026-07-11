import { SetType } from "~community/common/types/CommonTypes";
import { CrmDealResponseType } from "~community/crm/types/CommonTypes";
import { CrmDealSliceTypes } from "~community/crm/types/SliceTypes";
import { mergeDealUpdate } from "~community/crm/utils/crmUtil";

const CrmDealSlice = (
  set: SetType<CrmDealSliceTypes>,
  get: () => CrmDealSliceTypes
) => ({
  selectedDealId: null,
  deals: [],
  setSelectedDealId: (selectedDealId: number | null) => set({ selectedDealId }),
  setDeals: (deals: CrmDealResponseType[]) => set({ deals }),
  getDealById: (id: number) => get().deals.find((deal) => deal.id === id),
  updateDeal: (deal: CrmDealResponseType) =>
    set({ deals: mergeDealUpdate(get().deals, deal) }),
  removeDeal: (id: number) =>
    set({ deals: get().deals.filter((deal) => deal.id !== id) })
});

export default CrmDealSlice;
