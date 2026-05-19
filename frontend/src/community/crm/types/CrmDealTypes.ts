import { CrmDealType } from "./CommonTypes";

export type { CrmDealType };

export interface CrmDealsResponseType {
  items: CrmDealType[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}
