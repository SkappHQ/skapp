
import {  
  AnnouncementRecipientRoleEnum,
  AnnouncementStatusEnum,
  FrequencyTypeEnum,
  TargetPageEnum, 
  TriggerTypeEnum } from "../enums/AnnouncementEnums";

export interface ActiveAnnouncementType {
  announcementId: string;
  title: string;
  description: string;
  ctaLabel: string | null;
  ctaLink: string | null;
  recipientRoles: AnnouncementRecipientRoleEnum[];
  targetPage: TargetPageEnum;
  triggerType: TriggerTypeEnum;
  frequencyType: FrequencyTypeEnum;
  customFrequencyDays: number | null;
  status: AnnouncementStatusEnum;
  createdDate: string;
  imagePath: string | null;
}

export interface AnnouncementCacheType {
  announcements: ActiveAnnouncementType[];
  fetchedAt: string;
}
