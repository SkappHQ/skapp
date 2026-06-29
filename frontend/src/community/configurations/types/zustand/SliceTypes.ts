import { ConfigurationStoreTypes } from "./StoreTypes";

export interface DealStageSliceTypes extends Pick<
  ConfigurationStoreTypes,
  | "isDealStageModalOpen"
  | "setIsDealStageModalOpen"
  | "dealStageModalType"
  | "setDealStageModalType"
  | "selectedDealStageId"
  | "setSelectedDealStageId"
> {}
