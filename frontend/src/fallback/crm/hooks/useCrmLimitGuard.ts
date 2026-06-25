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
    limitedResource: null,
    isLimitModalOpen: false,
    closeLimitModal: () => {},
    isCheckingCrmLimit: false
  };
};

export default useCrmLimitGuard;
