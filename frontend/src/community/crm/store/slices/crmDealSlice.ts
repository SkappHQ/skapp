import { SetType } from "~community/common/types/CommonTypes";
import { CrmDealResponseType } from "~community/crm/types/CommonTypes";
import { CrmDealSliceTypes } from "~community/crm/types/SliceTypes";
import { mergeDealUpdate, mergeDealsList } from "~community/crm/utils/crmUtil";

const CrmDealSlice = (
  set: SetType<CrmDealSliceTypes>,
  get: () => CrmDealSliceTypes
) => ({
  selectedDealId: null,
  deals: [],
  setSelectedDealId: (selectedDealId: number | null) => set({ selectedDealId }),
  setDeals: (deals: CrmDealResponseType[]) =>
    set({ deals: mergeDealsList(get().deals, deals) }),
  getDealById: (id: number) => get().deals.find((deal) => deal.id === id),
  updateDeal: (deal: CrmDealResponseType) =>
    set({ deals: mergeDealUpdate(get().deals, deal) })
});

export default CrmDealSlice;
