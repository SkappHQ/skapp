import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCrmStore } from "~community/crm/store/store";
import { CrmOwnerEntity } from "~community/crm/types/CrmCommonTypes";
import { updateOwnerRecord } from "~community/crm/utils/commonUtil";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

export const useDefaultCrmOwner = (): CrmOwnerEntity | null => {
  const { owners, setOwners } = useCrmStore(
    useShallow((store) => ({
      owners: store.owners,
      setOwners: store.setOwners
    }))
  );

  const { data: currentUser } = useGetUserPersonalDetails();

  const defaultOwner = useMemo((): CrmOwnerEntity | null => {
    if (!currentUser?.employeeId) return null;

    return {
      employeeId: Number(currentUser.employeeId),
      firstName: currentUser.firstName ?? "",
      lastName: currentUser.lastName ?? "",
      authPic: currentUser.authPic as string | null
    };
  }, [
    currentUser?.employeeId,
    currentUser?.firstName,
    currentUser?.lastName,
    currentUser?.authPic
  ]);

  useEffect(() => {
    if (!defaultOwner) return;

    setOwners(updateOwnerRecord(owners, [defaultOwner]));
  }, [defaultOwner]);

  return defaultOwner;
};
