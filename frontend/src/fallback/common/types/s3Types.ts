export enum FileUrlTypes {
  PROFILE_PICTURE_ATTACHMENTS = "",
  LEAVE_REQUEST_ATTACHMENTS = "",
  ORGANIZATION_LOGO_ATTACHMENTS = ""
}

export interface RequestBody {
  name: string;
  type?: string;
  fileCategory: FileCategories;
  action?: S3ActionTypes;
  tenantId: string;
  folderPath?: string;
}

export enum S3ActionTypes {
  UPLOAD = "",
  DOWNLOAD = ""
}

export enum S3SignedUrlActions {
  PUT_OBJECT = "",
  GET_OBJECT = ""
}

export enum FileCategories {
  LEAVE_REQUEST = "",
  ORGANIZATION_LOGO = "",
  PROFILE_PICTURES = "",
  SUPPORT_REQUEST = ""
}
