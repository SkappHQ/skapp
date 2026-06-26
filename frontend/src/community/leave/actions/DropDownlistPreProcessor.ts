import { type DropdownListType } from "~community/common/types/CommonTypes";

import { LeaveTypesWithToggleType } from "../types/CustomLeaveAllocationTypes";
import { LeaveEntitlementsResponceType } from "../types/LeaveEntitlementTypes";

export const LeaveTypesDropDownlistPreProcessor = (
  leaveEntitlements: LeaveEntitlementsResponceType[],
  withEmojis: boolean
): DropdownListType[] => {
  const dropdownOptions = withEmojis
    ? leaveEntitlements
        ?.filter((item) => item.active)
        ?.map(
          (
            option: Pick<
              LeaveEntitlementsResponceType,
              "name" | "typeId" | "emoji" | "leaveDuration"
            >
          ) => {
            return {
              label: option?.name,
              value: option?.typeId,
              emoji: option?.emoji,
              leaveDuration: option?.leaveDuration
            };
          }
        )
    : leaveEntitlements
        ?.filter((item) => item.active)
        ?.map(
          (option: Pick<LeaveEntitlementsResponceType, "name" | "typeId">) => {
            return {
              label: option?.name,
              value: option?.typeId
            };
          }
        );
  return dropdownOptions;
};

export const LeaveTypesWithTogglePreProcessor = (
  leaveEntitlements: LeaveEntitlementsResponceType[]
): LeaveTypesWithToggleType => {
  const nameToToggleMap = leaveEntitlements?.reduce(
    (obj: Record<string, boolean>, { name }) => {
      obj[name] = true;
      return obj;
    },
    {}
  );
  const labels = leaveEntitlements?.map(({ name }) => String(name));
  const colorArray: string[] = leaveEntitlements
    ?.map((item) => item?.color ?? null)
    .filter((color): color is string => color !== null);
  const transformedData: Record<string, string> = {};
  leaveEntitlements?.forEach((item) => {
    transformedData[item?.name] = item?.color;
  });
  const extractedData = leaveEntitlements?.map(({ typeId, name }) => ({
    typeId,
    name
  }));
  const allId = leaveEntitlements?.map(({ typeId }) => typeId);
  return {
    labels,
    toggle: nameToToggleMap,
    colorArray,
    transformedData,
    extractedData,
    allId
  };
};
