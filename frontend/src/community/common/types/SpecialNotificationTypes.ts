import { SpecialNotificationType } from "~community/common/enums/SpecialNotificationEnums";

export interface SpecialNotificationViewedCacheType {
  userId: number;
  viewedDates: Partial<Record<SpecialNotificationType, string>>;
}

export interface SpecialNotificationContextType {
  isEligible: boolean;
  today: string;
  evaluationTick: number;
  isViewedToday: (specialNotificationType: SpecialNotificationType) => boolean;
  persistViewedDate: (
    specialNotificationType: SpecialNotificationType,
    lastViewedDate: string
  ) => void;
}
