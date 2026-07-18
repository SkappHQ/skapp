import { DocumentFolder } from "~community/common/types/DocumentFolderTypes";
import { DocumentResponse } from "~enterprise/common/types/DocumentFolderTypes";

export interface CommonModalData {
  employeeId?: number;
  parentId?: number;
  folder?: DocumentFolder;
  document?: DocumentResponse;
}
