import { useEffect } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useGetBoardInitData } from "~community/crm/v2/api/BoardApi";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmStore } from "~community/crm/v2/types/StoreTypes";
import {
  toContactsRecord,
  toOwnersRecord,
  toStagesRecord,
  toTaskTypesRecord
} from "~community/crm/v2/utils/crmEntityUtils";

export interface UseInitializeCrmDataReturn {
  isCrmInitialDataLoading: boolean;
  isCrmInitialDataError: boolean;
}

export const useInitializeCrmData = (): UseInitializeCrmDataReturn => {
  const translateText = useTranslator("crmModule", "common", "initData");
  const crmDataErrorTitle = translateText(["errorTitle"]);
  const crmDataErrorDescription = translateText(["errorDescription"]);

  const { setToastMessage } = useToast();

  const {
    isCrmDataInitialized,
    setStages,
    setOwners,
    setContacts,
    setTaskTypes,
    setIsCrmDataInitialized
  } = useCrmStoreV2((state: CrmStore) => ({
    isCrmDataInitialized: state.isCrmDataInitialized,
    setStages: state.setStages,
    setOwners: state.setOwners,
    setContacts: state.setContacts,
    setTaskTypes: state.setTaskTypes,
    setIsCrmDataInitialized: state.setIsCrmDataInitialized
  }));

  const { data, isLoading, isError, isSuccess } =
    useGetBoardInitData(!isCrmDataInitialized);

  useEffect(() => {
    if (isCrmDataInitialized || !isSuccess) return;

    setStages(toStagesRecord(data.stages));
    setOwners(toOwnersRecord(data.owners));
    setContacts(toContactsRecord(data.contacts));
    setTaskTypes(toTaskTypesRecord(data.taskTypes));
    setIsCrmDataInitialized(true);
  }, [data, isSuccess, isCrmDataInitialized]);

  useEffect(() => {
    if (!isError) return;

    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: crmDataErrorTitle,
      description: crmDataErrorDescription
    });
  }, [isError, crmDataErrorTitle, crmDataErrorDescription, setToastMessage]);

  return {
    isCrmInitialDataLoading: isLoading,
    isCrmInitialDataError: isError
  };
};
