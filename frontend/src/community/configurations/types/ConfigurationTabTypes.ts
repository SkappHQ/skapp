import { ReactNode } from "react";

import { AdminTypes } from "~community/common/types/AuthTypes";

export interface ConfigurationTab {
  id: string;
  label: string;
  requiredRoles: AdminTypes[];
  component: ReactNode;
}
