import { Modules } from "~community/common/enums/CommonEnums";

import { CrmDealStageType } from "~community/crm/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

interface actionTypes {
  setIsUserRoleModalOpen: (status: boolean) => void;
  setModuleType: (moduleType: Modules) => void;
  setIsDealStageModalOpen: (isDealStageModalOpen: boolean) => void;
  setDealStageModalType: (dealStageModalType: CrmModalTypes) => void;
  setSelectedDealStage: (stage: CrmDealStageType | null) => void;
}

export interface ConfigurationStoreTypes extends actionTypes {
  isUserRoleModalOpen: boolean;
  moduleType: Modules;
  isDealStageModalOpen: boolean;
  dealStageModalType: CrmModalTypes;
  selectedDealStage: CrmDealStageType | null;
}
