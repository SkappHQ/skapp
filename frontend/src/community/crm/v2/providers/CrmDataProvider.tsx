import { useRouter } from "next/router";
import { FC, ReactNode, useEffect } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetBoardInitData } from "~community/crm/api/BoardApi";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmStore } from "~community/crm/v2/types/StoreTypes";
import {
  toContactsRecord,
  toOwnersRecord,
  toStagesRecord
} from "~community/crm/v2/utils/crmEntityUtils";
import { isCrmRoute } from "~community/crm/v2/utils/crmRouteUtils";

interface CrmDataProviderProps {
  children: ReactNode;
}

export const CrmDataProvider: FC<CrmDataProviderProps> = ({ children }) => {
  const { asPath } = useRouter();
  const translateText = useTranslator("crmModule", "common", "initData");

  const {
    setStages,
    setOwners,
    setContacts,
    setCrmDataLoading,
    setCrmDataError
  } = useCrmStoreV2((state: CrmStore) => ({
    setStages: state.setStages,
    setOwners: state.setOwners,
    setContacts: state.setContacts,
    setCrmDataLoading: state.setCrmDataLoading,
    setCrmDataError: state.setCrmDataError
  }));

  const { data, isLoading, isError, isSuccess } = useGetBoardInitData(
    isCrmRoute(asPath)
  );

  useEffect(() => {
    setCrmDataLoading(isLoading);

    if (isError) {
      setCrmDataError(translateText(["errorDescription"]));
      return;
    }

    if (isSuccess) {
      setStages(toStagesRecord(data.stages));
      setOwners(toOwnersRecord(data.owners));
      setContacts(toContactsRecord(data.contacts));
      setCrmDataError(null);
    }
  }, [data, isLoading, isError, isSuccess]);

  return <>{children}</>;
};
