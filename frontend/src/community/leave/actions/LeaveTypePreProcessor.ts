import { DropdownListType } from "~community/common/types/CommonTypes";
import {
  LeaveTypePayloadType,
  LeaveTypesWithToggleType
} from "~community/leave/types/AddLeaveTypes";
import { LeaveTypesDropDownlistType } from "~community/leave/types/LeaveEntitlementTypes";

export const LeaveTypesWithTogglePreProcessor = (
  leaveTypes: LeaveTypePayloadType[]
): LeaveTypesWithToggleType => {
  const nameToToggleMap = leaveTypes?.reduce(
    (obj: Record<string, boolean>, { name }) => {
      obj[name] = true;
      return obj;
    },
    {}
  );
  const labels = leaveTypes?.map(({ name }) => String(name));
  const colorArray: string[] = leaveTypes?.map(
    (item) => item?.colorCode ?? null
  );
  const transformedData: Record<string, string> = {};
  leaveTypes?.forEach((item) => {
    transformedData[item?.name] = item?.colorCode;
  });
  const extractedData = leaveTypes?.map(({ typeId, name }) => ({
    typeId,
    name
  }));
  const allId = leaveTypes?.map(({ typeId }) => typeId) as unknown as number[];
  return {
    labels,
    toggle: nameToToggleMap,
    colorArray,
    transformedData,
    extractedData,
    allId
  };
};

export const LeaveTypesDropDownlistPreProcessor = (
  leaveTypes: LeaveTypePayloadType[],
  withEmojis: boolean
): DropdownListType[] => {
  const dropdownOptions = withEmojis
    ? leaveTypes
        ?.filter((item) => item.isActive)
        ?.map(
          (
            option: Pick<
              LeaveTypePayloadType,
              "name" | "typeId" | "emojiCode" | "leaveDuration"
            >
          ) => {
            return {
              label: option?.name,
              value: option?.typeId,
              emoji: option?.emojiCode,
              leaveDuration: option?.leaveDuration
            };
          }
        )
    : leaveTypes
        ?.filter((item) => item.isActive)
        ?.map((option: Pick<LeaveTypePayloadType, "name" | "typeId">) => {
          return {
            label: option?.name,
            value: option?.typeId
          };
        });

  return dropdownOptions;
};

export const LeaveTypesPreProcessor = (
  leaveTypes: LeaveTypePayloadType[]
): LeaveTypesDropDownlistType[] => {
  const preProcessedAllLeaveTypes = leaveTypes?.map(
    (type: LeaveTypePayloadType) => {
      return {
        typeId: type.typeId as unknown as number,
        name: type.name,
        label: type.name,
        value: type.typeId as unknown as number,
        emoji: type.emojiCode
      };
    }
  );
  return preProcessedAllLeaveTypes;
};
