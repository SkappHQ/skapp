import { useEffect } from "react";

import { useGetBoardInitData } from "~community/crm/v2/api/BoardApi";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmStore } from "~community/crm/v2/types/StoreTypes";
import {
  toContactsRecord,
  toOwnersRecord,
  toStagesRecord,
  toTaskTypesRecord
} from "~community/crm/v2/utils/crmEntityUtils";

export interface CrmSessionResult {
  isError: boolean;
}

export const useCrmSession = (): CrmSessionResult => {
  const {
    crmSessionInitialised,
    setStages,
    setOwners,
    setContacts,
    setTaskTypes,
    setCrmSessionInitialised
  } = useCrmStoreV2((state: CrmStore) => ({
    crmSessionInitialised: state.crmSessionInitialised,
    setStages: state.setStages,
    setOwners: state.setOwners,
    setContacts: state.setContacts,
    setTaskTypes: state.setTaskTypes,
    setCrmSessionInitialised: state.setCrmSessionInitialised
  }));

  const { data, isError, isSuccess } = useGetBoardInitData(
    !crmSessionInitialised
  );

  useEffect(() => {
    if (crmSessionInitialised || !isSuccess) return;

    setStages(toStagesRecord(data.stages));
    setOwners(toOwnersRecord(data.owners));
    setContacts(toContactsRecord(data.contacts));
    setTaskTypes(toTaskTypesRecord(data.taskTypes));
    setCrmSessionInitialised(true);
  }, [data, isSuccess, crmSessionInitialised]);

  return { isError };
};
