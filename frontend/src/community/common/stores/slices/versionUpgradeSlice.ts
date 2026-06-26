import { VersionUpgradeInfoType } from "~community/common/types/VersionUpgrade";
import { SetType } from "~community/common/types/storeTypes";
import { VersionUpgradeSliceTypes } from "~community/common/types/zustand/slices/VersionUpgradeSliceType";

export const versionUpgradeSlice = (
  set: SetType<VersionUpgradeSliceTypes>
): VersionUpgradeSliceTypes => ({
  isWeeklyNotifyDisplayed: false,
  isDailyNotifyDisplayed: false,
  currentWeek: 0,
  showInfoBanner: false,
  showInfoModal: false,
  versionUpgradeInfo: {
    bannerDescription: "",
    popupTitle: "",
    popupDescription: "",
    buttonText: "",
    type: "",
    redirectUrl: ""
  },
  setCurrentWeek: (week: number) =>
    set((state: VersionUpgradeSliceTypes) => ({
      ...state,
      currentWeek: week
    })),
  setIsDailyNotifyDisplayed: (value: boolean) =>
    set((state: VersionUpgradeSliceTypes) => ({
      ...state,
      isDailyNotifyDisplayed: value
    })),
  setIsWeeklyNotifyDisplayed: (value: boolean) =>
    set((state: VersionUpgradeSliceTypes) => ({
      ...state,
      isWeeklyNotifyDisplayed: value
    })),
  setShowInfoBanner: (value: boolean) =>
    set((state: VersionUpgradeSliceTypes) => ({
      ...state,
      showInfoBanner: value
    })),
  setShowInfoModal: (value: boolean) =>
    set((state: VersionUpgradeSliceTypes) => ({
      ...state,
      showInfoModal: value
    })),
  setVersionUpgradeInfo: (values: VersionUpgradeInfoType) =>
    set((state: VersionUpgradeSliceTypes) => ({
      ...state,
      versionUpgradeInfo: values
    })),
  clearVersionUpgradeInfo: () =>
    set((state: VersionUpgradeSliceTypes) => ({
      ...state,
      versionUpgradeInfo: {
        bannerDescription: "",
        popupTitle: "",
        popupDescription: "",
        buttonText: "",
        type: "",
        redirectUrl: ""
      }
    }))
});
