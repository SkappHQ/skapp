import { useTranslator } from "~community/common/hooks/useTranslator";

export const MAX_NUM_OF_SUPERVISORS_PER_TEAM = 3;

export const ITEMS_PER_PAGE = 12;
export const MAX_HOLIDAY_COUNT_PER_DAY = 3;
export const MAX_HOLIDAY_NAME_CHARACTERS = 50;
export const MAX_SUPERVISOR_LIMIT = 3;
export const ADDRESS_MAX_CHARACTER_LENGTH = 255;
export const NAME_MAX_CHARACTER_LENGTH = 50;
export const PASSPORT_AND_NIN_MAX_CHARACTER_LENGTH = 15;
export const SOCIAL_MEDIA_MAX_CHARACTER_LENGTH = 2083;

export const useHolidayMessages = () => {
  const translateText = useTranslator("peopleModule", "holidays");
  return {
    PAST_HOLIDAY: translateText(["pastHolidayText"]),
    LEAVE_REQUEST_COLLISION: translateText(["leaveRequestCollisionText"])
  };
};

export const CONCURRENT_HOLIDAY = "The Maximum of 3 holidays allowed per day";
