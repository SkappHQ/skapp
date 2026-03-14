import authFetch from "~community/common/utils/axiosInterceptor";

import { announcementEndpoints } from "./utils/ApiEndpoints";
import { AnnouncementInteractionTypeEnum } from "../enums/AnnouncementEnums";
import { ActiveAnnouncementType } from "../types/AnnouncementTypes";

/**
 * Fetches the eligible announcements for the currently authenticated user.
 * Called imperatively after login — not via react-query.
 */
export const fetchEligibleAnnouncements = async (): Promise<
  ActiveAnnouncementType[]
> => {
  const response = await authFetch.get(announcementEndpoints.ELIGIBLE);
  const results = response.data?.results;
  if (Array.isArray(results)) {
    return results as ActiveAnnouncementType[];
  }
  return [];
};

/**
 * Records a user interaction for a specific announcement.
 * Fire-and-forget — errors are silently swallowed to avoid disrupting the UI.
 */
export const recordAnnouncementInteraction = (
  announcementId: string,
  type: AnnouncementInteractionTypeEnum
): void => {
  authFetch
    .post(announcementEndpoints.INTERACT(announcementId), { type })
    .catch(() => {
      // Intentionally silent — interaction tracking should never block the UI
    });
};
