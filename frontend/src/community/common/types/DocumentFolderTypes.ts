import { DocumentPermissionRole } from "~enterprise/common/enums/DocumentFolderEnums";

export interface DocumentFolder {
  id: string;
  name: string;
  role?: DocumentPermissionRole;
}
