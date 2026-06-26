import { VersionUpgradeStoreTypes } from "../StoreTypes";

export interface VersionUpgradeSliceTypes
  extends Pick<
    VersionUpgradeStoreTypes,
    | "isDailyNotifyDisplayed"
    | "isWeeklyNotifyDisplayed"
    | "setIsDailyNotifyDisplayed"
    | "setIsWeeklyNotifyDisplayed"
    | "setCurrentWeek"
    | "currentWeek"
    | "showInfoBanner"
    | "showInfoModal"
    | "setShowInfoBanner"
    | "setShowInfoModal"
    | "setVersionUpgradeInfo"
    | "clearVersionUpgradeInfo"
    | "versionUpgradeInfo"
  > {}
