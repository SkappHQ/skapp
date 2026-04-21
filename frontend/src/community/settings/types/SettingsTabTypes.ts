import { ReactNode } from "react";

import { AdminTypes, EmployeeTypes, ManagerTypes } from "~community/common/types/AuthTypes";

export interface SettingsTab {
  id: string;
  label: string;
  requiredRoles: (AdminTypes | ManagerTypes | EmployeeTypes)[];
  component: ReactNode;
  position?: number;
}
