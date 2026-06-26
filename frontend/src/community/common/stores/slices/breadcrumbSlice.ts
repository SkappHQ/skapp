import { BreadcrumbItem } from "@rootcodelabs/skapp-ui";

import { SetType } from "~community/common/types/storeTypes";

export interface BreadcrumbSliceType {
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;
}

export const breadcrumbSlice = (
  set: SetType<BreadcrumbSliceType>
): BreadcrumbSliceType => ({
  breadcrumbs: [],
  setBreadcrumbs: (items: BreadcrumbItem[]) =>
    set((state) => ({
      ...state,
      breadcrumbs: items
    }))
});
