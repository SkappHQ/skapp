import { GlobalLoginMethod } from "~community/common/enums/CommonEnums";

interface CommonEnterpriseStore {
  setGlobalLoginMethod: (value: GlobalLoginMethod) => void;
  globalLoginMethod: GlobalLoginMethod;
  ongoingQuickSetup: {
    INVITE_EMPLOYEES: boolean;
    DEFINE_TEAMS: boolean;
    DEFINE_JOB_FAMILIES: boolean;
    SETUP_HOLIDAYS: boolean;
    SETUP_LEAVE_TYPES: boolean;
  };
  setQuickSetupModalType: (value: string) => void;
  stopAllOngoingQuickSetup: () => void;
}

export const useCommonEnterpriseStore = (
  arg0: (state: any) => any
): CommonEnterpriseStore => {
  return {
    setGlobalLoginMethod: () => {},
    globalLoginMethod: GlobalLoginMethod.NONE,
    ongoingQuickSetup: {
      INVITE_EMPLOYEES: false,
      DEFINE_TEAMS: false,
      DEFINE_JOB_FAMILIES: false,
      SETUP_HOLIDAYS: false,
      SETUP_LEAVE_TYPES: false
    },
    setQuickSetupModalType: () => {},
    stopAllOngoingQuickSetup: () => {}
  };
};
