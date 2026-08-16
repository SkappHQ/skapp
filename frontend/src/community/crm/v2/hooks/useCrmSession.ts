import { useEffect } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetBoardInitData } from "~community/crm/v2/api/BoardApi";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmStore } from "~community/crm/v2/types/StoreTypes";
import {
  toContactsRecord,
  toOwnersRecord,
  toStagesRecord,
  toTaskTypesRecord
} from "~community/crm/v2/utils/crmEntityUtils";

export const useCrmSession = (): void => {
  const translateText = useTranslator("crmModule", "common", "initData");
  const errorDescription = translateText(["errorDescription"]);

  const {
    stages,
    setStages,
    setOwners,
    setContacts,
    setTaskTypes,
    setCrmDataLoading,
    setCrmDataError
  } = useCrmStoreV2((state: CrmStore) => ({
    stages: state.stages,
    setStages: state.setStages,
    setOwners: state.setOwners,
    setContacts: state.setContacts,
    setTaskTypes: state.setTaskTypes,
    setCrmDataLoading: state.setCrmDataLoading,
    setCrmDataError: state.setCrmDataError
  }));

  const isInitialised = Object.keys(stages).length > 0;

  const { data, isLoading, isError, isSuccess } =
    useGetBoardInitData(!isInitialised);

  useEffect(() => {
    if (isInitialised) return;

    setCrmDataLoading(isLoading);

    if (isError) {
      setCrmDataError(errorDescription);
      return;
    }

    if (isSuccess) {
      setStages(toStagesRecord(data.stages ?? []));
      setOwners(toOwnersRecord(data.owners ?? []));
      setContacts(toContactsRecord(data.contacts ?? []));
      setTaskTypes(toTaskTypesRecord(data.taskTypes ?? []));
      setCrmDataError(null);
    }
  }, [
    data,
    isLoading,
    isError,
    isSuccess,
    isInitialised,
    errorDescription,
    setStages,
    setOwners,
    setContacts,
    setTaskTypes,
    setCrmDataLoading,
    setCrmDataError
  ]);
};
