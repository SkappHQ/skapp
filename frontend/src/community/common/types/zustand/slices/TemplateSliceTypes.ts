import { type CommonStoreTypes } from "~community/common/types/zustand/StoreTypes";

export interface TemplateSliceTypes
  extends Pick<
    CommonStoreTypes,
    | "isDrawerExpanded"
    | "expandedDrawerListItem"
    | "s3FileUrls"
    | "setIsDrawerExpanded"
    | "setExpandedDrawerListItem"
    | "setS3FileUrls"
  > {}

export interface OrganizationSLiceTypes
  extends Pick<
    CommonStoreTypes,
    | "country"
    | "organizationLogo"
    | "organizationName"
    | "organizationWebsite"
    | "themeColor"
    | "setOrgData"
  > {}
