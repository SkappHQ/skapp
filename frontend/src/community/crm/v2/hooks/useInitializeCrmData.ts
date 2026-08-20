import { useEffect } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useGetBoardInitData } from "~community/crm/v2/api/BoardApi";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  toContactsRecord,
  toOwnersRecord,
  toStagesRecord,
  toTaskTypesRecord
} from "~community/crm/v2/utils/crmEntityUtils";

interface UseInitializeCrmDataReturn {
  isCrmInitialDataLoading: boolean;
  isCrmInitialDataError: boolean;
}

export const useInitializeCrmData = (): UseInitializeCrmDataReturn => {
  const translateText = useTranslator("crmModule", "common", "initData");

  const { setToastMessage } = useToast();

  const isCrmDataInitialized = useCrmStoreV2(
    (state) => state.isCrmDataInitialized
  );
  const setStages = useCrmStoreV2((state) => state.setStages);
  const setOwners = useCrmStoreV2((state) => state.setOwners);
  const setContacts = useCrmStoreV2((state) => state.setContacts);
  const setTaskTypes = useCrmStoreV2((state) => state.setTaskTypes);
  const setIsCrmDataInitialized = useCrmStoreV2(
    (state) => state.setIsCrmDataInitialized
  );

  const { data, isLoading, isError, isSuccess } =
    useGetBoardInitData(!isCrmDataInitialized);

  useEffect(() => {
    if (isError) {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["errorTitle"]),
        description: translateText(["errorDescription"])
      });
    }

    if (isCrmDataInitialized || !isSuccess || !data) return;

    setStages(toStagesRecord(data.stages));
    setOwners(toOwnersRecord(data.owners));
    setContacts(toContactsRecord(data.contacts));
    setTaskTypes(toTaskTypesRecord(data.taskTypes));
    setIsCrmDataInitialized(true);
  }, [data, isSuccess, isError, isCrmDataInitialized]);

  return {
    isCrmInitialDataLoading: isLoading,
    isCrmInitialDataError: isError
  };
};
