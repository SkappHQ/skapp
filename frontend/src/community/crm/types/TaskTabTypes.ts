import { CrmTaskTabEnum } from "../enums/common";

export interface CrmTaskTab {
  id: CrmTaskTabEnum;
  label: string;
  position?: number;
}
