export interface BirthdayNotificationConfigType {
  isTurnedOn: boolean;
  isTeamWide: boolean;
  isOrganizationWide: boolean;
}

export type BirthdayNotificationConfigPatchType =
  Partial<BirthdayNotificationConfigType>;
