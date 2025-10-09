import { OrganizationCreateType } from "../OrganizationCreateTypes";
import { SettingsModalTypes } from "../SettingsTypes";
import { VersionUpgradeInfoType } from "../VersionUpgrade";
import { NotifyFilterButtonTypes } from "../notificationTypes";

interface actionTypes {
  setIsDrawerExpanded: (status: boolean) => void;
  setExpandedDrawerListItem: (listItem: string) => void;
  setS3FileUrls: (fileUrls: Record<string, string>) => void;
}

export interface CommonStoreTypes extends actionTypes {
  isDrawerExpanded: boolean;
  expandedDrawerListItem: string;
  s3FileUrls: Record<string, string>;

  // Settings
  modalType: SettingsModalTypes;
  setModalType: (value: SettingsModalTypes) => void;
  isModalOpen: boolean;
  setModalOpen: (value: boolean) => void;

  // Notifications
  notifyData: {
    unreadCount: number;
    isUnreadCountVisible: boolean;
    notificationFilterType: NotifyFilterButtonTypes;
  };
  setNotifyData: (value: {
    unreadCount?: number;
    isUnreadCountVisible?: boolean;
    notificationFilterType?: NotifyFilterButtonTypes;
  }) => void;

  // org
  organizationName: string;
  organizationWebsite: string;
  country: string;
  organizationLogo: string;
  themeColor: string;
  setOrgData: (values: OrganizationCreateType) => void;
}

interface VersionUpgradeActionTypes {
  setIsDailyNotifyDisplayed: (value: boolean) => void;
  setIsWeeklyNotifyDisplayed: (value: boolean) => void;
  setCurrentWeek: (week: number) => void;
  setShowInfoBanner: (value: boolean) => void;
  setShowInfoModal: (value: boolean) => void;
  setVersionUpgradeInfo: (values: VersionUpgradeInfoType) => void;
  clearVersionUpgradeInfo: () => void;
}

export interface VersionUpgradeStoreTypes extends VersionUpgradeActionTypes {
  isWeeklyNotifyDisplayed: boolean;
  isDailyNotifyDisplayed: boolean;
  currentWeek: number;
  showInfoBanner: boolean;
  showInfoModal: boolean;
  versionUpgradeInfo: VersionUpgradeInfoType;
}
