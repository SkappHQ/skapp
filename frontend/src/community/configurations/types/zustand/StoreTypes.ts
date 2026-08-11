import { Modules } from "~community/common/enums/CommonEnums";

import { CrmModalTypes } from "~community/crm/types/ModalTypes";

interface actionTypes {
  setIsUserRoleModalOpen: (status: boolean) => void;
  setModuleType: (moduleType: Modules) => void;
  setIsDealStageModalOpen: (isDealStageModalOpen: boolean) => void;
  setDealStageModalType: (dealStageModalType: CrmModalTypes) => void;
  setSelectedDealStageId: (stageId: number | null) => void;
  setIsPeopleWorkspaceSaveTriggered: (isTriggered: boolean) => void;
  setIsPeopleWorkspaceResetTriggered: (isTriggered: boolean) => void;
  setIsPeopleWorkspaceDirty: (isDirty: boolean) => void;
  setIsPeopleWorkspaceSubmitting: (isSubmitting: boolean) => void;
}

export interface ConfigurationStoreTypes extends actionTypes {
  isUserRoleModalOpen: boolean;
  moduleType: Modules;
  isDealStageModalOpen: boolean;
  dealStageModalType: CrmModalTypes;
  selectedDealStageId: number | null;
  isPeopleWorkspaceSaveTriggered: boolean;
  isPeopleWorkspaceResetTriggered: boolean;
  isPeopleWorkspaceDirty: boolean;
  isPeopleWorkspaceSubmitting: boolean;
}
