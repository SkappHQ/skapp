import { BreadcrumbItem } from "@rootcodelabs/skapp-ui";

import { CommonModalType } from "../../enums/CommonModalEnums";
import { CommonModalData } from "../CommonModalTypes";
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

  // Common modal
  commonModalType: CommonModalType;
  isCommonModalOpen: boolean;
  commonModalData: CommonModalData | null;
  openCommonModal: (modalType: CommonModalType, data?: CommonModalData) => void;
  closeCommonModal: () => void;

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

  // Breadcrumbs
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;

  // Auth token
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  clearAccessToken: () => void;
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
