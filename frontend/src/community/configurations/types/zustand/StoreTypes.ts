import { Modules } from "~community/common/enums/CommonEnums";

interface actionTypes {
  setIsUserRoleModalOpen: (status: boolean) => void;
  setModuleType: (moduleType: Modules) => void;
}

export interface ConfigurationStoreTypes extends actionTypes {
  isUserRoleModalOpen: boolean;
  moduleType: Modules;
}
