import { useRouter } from "next/router";
import { FC, ReactNode, useEffect } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetBoardInitData } from "~community/crm/api/BoardApi";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  replaceStageIds,
  toContactsRecord,
  toOwnersRecord,
  toStagesRecord,
  toTaskTypesRecord
} from "~community/crm/v2/utils/crmEntityUtils";
import { isCrmRoute } from "~community/crm/v2/utils/crmRouteUtils";

export const CrmDataProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { asPath } = useRouter();
  const translateText = useTranslator("crmModule", "common", "initData");

  const { data, isLoading, error } = useGetBoardInitData(isCrmRoute(asPath));

  const {
    setStages,
    setStageIds,
    setOwners,
    setContacts,
    setTaskTypes,
    setCrmDataLoading,
    setCrmDataError
  } = useCrmStoreV2((state) => ({
    setStages: state.setStages,
    setStageIds: state.setStageIds,
    setOwners: state.setOwners,
    setContacts: state.setContacts,
    setTaskTypes: state.setTaskTypes,
    setCrmDataLoading: state.setCrmDataLoading,
    setCrmDataError: state.setCrmDataError
  }));

  useEffect(() => {
    setCrmDataLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (error) {
      setCrmDataError(translateText(["errorDescription"]));
      return;
    }

    if (!data) return;

    setStages(toStagesRecord(data.stages));
    setStageIds(replaceStageIds(data.stages));
    setOwners(toOwnersRecord(data.owners));
    setContacts(toContactsRecord(data.contacts));
    setTaskTypes(toTaskTypesRecord(data.taskTypes));
    setCrmDataError(null);
  }, [data, error]);

  return <>{children}</>;
};
