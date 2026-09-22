import { BusinessUnit } from "~community/common/types/BusinessUnitTypes";
import { DocumentFolder } from "~community/common/types/DocumentFolderTypes";
import { DocumentResponse } from "~enterprise/common/types/DocumentFolderTypes";

export interface CommonModalData {
  employeeId?: number;
  parentId?: number;
  folder?: DocumentFolder;
  document?: DocumentResponse;
  documentCount?: number;
  businessUnit?: BusinessUnit;
}
