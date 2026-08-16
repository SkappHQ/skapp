import { FC, ReactNode } from "react";

import { useCrmSession } from "~community/crm/v2/hooks/useCrmSession";

interface CrmDataProviderProps {
  children: ReactNode;
}

export const CrmDataProvider: FC<CrmDataProviderProps> = ({ children }) => {
  useCrmSession();

  return <>{children}</>;
};
