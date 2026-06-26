import { OrganizationCreateType } from "~community/common/types/OrganizationCreateTypes";
import { SetType } from "~community/common/types/storeTypes";
import { OrganizationSLiceTypes } from "~community/common/types/zustand/slices/TemplateSliceTypes";

export const orgDetailsSlice = (set: SetType<OrganizationSLiceTypes>) => ({
  country: "Sri Lanka",
  organizationLogo: "",
  organizationName: "",
  organizationWebsite: "",
  themeColor: "",
  setOrgData: (values: OrganizationCreateType) =>
    set((state: OrganizationSLiceTypes) => ({
      ...state,
      country: values.country,
      organizationLogo: values.organizationLogo,
      organizationName: values.organizationName,
      organizationWebsite: values.organizationWebsite,
      themeColor: values.themeColor
    }))
});
