import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useGetBoardInitData } from "~community/crm/v2/api/BoardApi";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  toOwnersRecord,
  toStagesRecord,
  toTaskTypesRecord
} from "~community/crm/v2/utils/commonUtil";
import { toContactsRecord } from "~community/crm/v2/utils/contactUtil";

interface UseInitializeCrmDataReturn {
  isCrmInitialDataLoading: boolean;
  isCrmInitialDataError: boolean;
}

export const useInitializeCrmData = (): UseInitializeCrmDataReturn => {
  const translateText = useTranslator("crmModule", "common", "initData");

  const { setToastMessage } = useToast();

  const {
    isCrmDataInitialized,
    setStages,
    setOwners,
    setContacts,
    setTaskTypes,
    setIsCrmDataInitialized
  } = useCrmStoreV2(
    useShallow((store) => ({
      isCrmDataInitialized: store.isCrmDataInitialized,
      setStages: store.setStages,
      setOwners: store.setOwners,
      setContacts: store.setContacts,
      setTaskTypes: store.setTaskTypes,
      setIsCrmDataInitialized: store.setIsCrmDataInitialized
    }))
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
