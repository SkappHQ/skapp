import { useRouter } from "next/router";
import { FC, PropsWithChildren, useEffect } from "react";

import ROUTES from "~community/common/constants/routes";
import { useGetBoardInitData } from "~community/crm/api/BoardApi";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  replaceStageIds,
  toContactsRecord,
  toOwnersRecord,
  toStagesRecord,
  toTaskTypesRecord
} from "~community/crm/v2/store/utils/crmEntityUtils";
import { CrmInitDataResponse } from "~community/crm/v2/types/CrmTypes";

export const CrmDataProvider: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const isOnCrmRoute = router.pathname.startsWith(ROUTES.CRM.BASE);

  const { data } = useGetBoardInitData(isOnCrmRoute) as {
    data?: CrmInitDataResponse;
  };

  const { setStages, setStageIds, setOwners, setContacts, setTaskTypes } =
    useCrmStoreV2((state) => state);

  useEffect(() => {
    if (!data) return;

    setStages(toStagesRecord(data.stages));
    setStageIds(replaceStageIds(data.stages));
    setOwners(toOwnersRecord(data.owners));
    setContacts(toContactsRecord(data.contacts));
    setTaskTypes(toTaskTypesRecord(data.taskTypes));
  }, [data]);

  return children;
};
