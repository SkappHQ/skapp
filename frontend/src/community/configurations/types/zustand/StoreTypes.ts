import { Modules } from "~community/common/enums/CommonEnums";
import { DealStageSliceType } from "../../stores/slices/dealStageSlice";

interface actionTypes {
  setIsUserRoleModalOpen: (status: boolean) => void;
  setModuleType: (moduleType: Modules) => void;
}

export interface ConfigurationStoreTypes extends actionTypes,
    DealStageSliceType {
  isUserRoleModalOpen: boolean;
  moduleType: Modules;
}
