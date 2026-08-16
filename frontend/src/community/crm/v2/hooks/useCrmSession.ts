import { useEffect } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetBoardInitData } from "~community/crm/api/BoardApi";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmStore } from "~community/crm/v2/types/StoreTypes";
import {
  toContactsRecord,
  toOwnersRecord,
  toStagesRecord
} from "~community/crm/v2/utils/crmEntityUtils";

export const useCrmSession = (): void => {
  const translateText = useTranslator("crmModule", "common", "initData");

  const isInitialised = useCrmStoreV2(
    (state: CrmStore) => Object.keys(state.stages).length > 0
  );

  const { data, isLoading, isError, isSuccess } =
    useGetBoardInitData(!isInitialised);

  useEffect(() => {
    if (isInitialised) return;

    const {
      setStages,
      setOwners,
      setContacts,
      setCrmDataLoading,
      setCrmDataError
    }: CrmStore = useCrmStoreV2.getState();

    setCrmDataLoading(isLoading);

    if (isError) {
      setCrmDataError(translateText(["errorDescription"]));
      return;
    }

    if (isSuccess) {
      setStages(toStagesRecord(data.stages ?? []));
      setOwners(toOwnersRecord(data.owners ?? []));
      setContacts(toContactsRecord(data.contacts ?? []));
      setCrmDataError(null);
    }
  }, [data, isLoading, isError, isSuccess, isInitialised, translateText]);
};
