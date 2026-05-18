export type {
  CrmDealType,
  CrmDealStageType,
  CrmPriorityType,
  ContactDeal
} from "./CommonTypes";

import { ContactDeal } from "./CommonTypes";

export interface CrmDealsResponseType {
  items: ContactDeal[];
}
