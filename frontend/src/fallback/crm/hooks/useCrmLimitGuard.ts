import type { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

const useCrmLimitGuard = () => {
  const guardCrmCreate = (
    _resource: CrmLimitResource,
    onAllowed: () => void
  ) => {
    onAllowed();
  };

  return {
    guardCrmCreate,
    isCheckingCrmLimit: false
  };
};

export default useCrmLimitGuard;
