import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useGetBoardInitData } from "~community/crm/v2/api/BoardApi";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { toContactsRecord } from "~community/crm/v2/utils/contactUtil";
import {
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

  const {
    isCrmDataInitialized,
    setStages,
    setOwners,
    setContacts,
    setTaskTypes,
    setIsCrmDataInitialized
  } = useCrmStoreV2(
    useShallow((state) => ({
      isCrmDataInitialized: state.isCrmDataInitialized,
      setStages: state.setStages,
      setOwners: state.setOwners,
      setContacts: state.setContacts,
      setTaskTypes: state.setTaskTypes,
      setIsCrmDataInitialized: state.setIsCrmDataInitialized
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

    if (isCrmDataInitialized || !isSuccess) return;

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
