import { useRouter } from "next/router";
import { FC, PropsWithChildren, useEffect } from "react";

import ROUTES from "~community/common/constants/routes";
import { useGetBoardInitData } from "~community/crm/api/BoardApi";
import { useGetTaskTypes } from "~community/crm/api/TaskApi";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  toContactsRecord,
  toOwnersRecord,
  toStagesRecord,
  toTaskTypesRecord
} from "~community/crm/v2/store/utils/crmEntityUtils";
import {
  CrmBoardInitDataResponse,
  CrmTaskTypeListResponse
} from "~community/crm/v2/types/CrmTypes";

export const CrmDataProvider: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const isOnCrmRoute = router.pathname.startsWith(ROUTES.CRM.BASE);

  const { data } = useGetBoardInitData(isOnCrmRoute) as {
    data?: CrmBoardInitDataResponse;
  };
  const { data: taskTypesData } = useGetTaskTypes(isOnCrmRoute) as {
    data?: CrmTaskTypeListResponse;
  };

  useEffect(() => {
    if (!data) return;

    const { setStages, setOwners, setContacts } = useCrmStoreV2.getState();
    setStages(
      toStagesRecord(data.stages),
      data.stages.map((stage) => stage.id!)
    );
    setOwners(toOwnersRecord(data.owners));
    setContacts(toContactsRecord(data.contacts));
  }, [data]);

  useEffect(() => {
    if (!taskTypesData) return;

    useCrmStoreV2
      .getState()
      .setTaskTypes(toTaskTypesRecord(taskTypesData.taskTypes));
  }, [taskTypesData]);

  return children;
};
