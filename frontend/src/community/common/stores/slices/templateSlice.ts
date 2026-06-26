import { SetType } from "~community/common/types/storeTypes";
import { TemplateSliceTypes } from "~community/common/types/zustand/slices/TemplateSliceTypes";

export const templateSlice = (
  set: SetType<TemplateSliceTypes>
): TemplateSliceTypes => ({
  isDrawerExpanded: true,
  expandedDrawerListItem: "",
  s3FileUrls: {},
  setIsDrawerExpanded: (status: boolean) =>
    set((state: TemplateSliceTypes) => ({
      ...state,
      isDrawerExpanded: status
    })),
  setExpandedDrawerListItem: (listItem: string) =>
    set((state: TemplateSliceTypes) => ({
      ...state,
      expandedDrawerListItem: listItem
    })),
  setS3FileUrls: (fileUrls: Record<string, string>) =>
    set((state: TemplateSliceTypes) => ({
      ...state,
      s3FileUrls: { ...state.s3FileUrls, ...fileUrls }
    }))
});
