import { ReactNode } from "react";

export interface CrmTaskTab {
  id: string;
  label: string;
  component: ReactNode;
  position?: number;
}
