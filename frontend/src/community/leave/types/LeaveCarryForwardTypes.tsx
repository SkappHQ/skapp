import { JSX } from "react";

export interface LeaveType {
  typeId: number;
  name: string;
  color: string;
  emojiCode?: string;
  active?: boolean;
  label?: string;
}

export enum calculationType {
  ACCUMULATED = "ACCUMULATED",
  UNLIMITED = "UNLIMITED"
}

export enum LeaveCarryForwardModalTypes {
  CARRY_FORWARD_TYPE_SELECTION = "Carry Forward Type Selection",
  CARRY_FORWARD = "Carry Forward",
  CARRY_FORWARD_BALANCE = "Carry Forward Balances",
  CARRY_FORWARD_INELIGIBLE = "Carry Forward Ineligible",
  CARRY_FORWARD_TYPES_NOT_AVAILABLE = "Carry Forward Types Not Available",
  CARRY_FORWARD_CONFIRM_SYNCHRONIZATION = "Confirm Synchronization",
  NONE = "None"
}

export interface carryForwardPaginationType {
  year: number;
  sortOrder: string;
  page: number;
  size: number;
  leaveTypes: number[];
}

export type carryForwardLeaveEntitlementsType = {
  employee: carryForwardEntitlementUserType;
  entitlements: carryForwardEntitlementType[];
};

export type carryForwardEntitlementUserType = {
  employeeId: string;
  name: string;
  lastName: string;
  firstName: string;
  email: string;
  authPic: string;
};

export type carryForwardEntitlementType = {
  leaveTypeId: number;
  totalDaysAllocated: number;
  totalDaysUsed: number;
  carryForwardAmount: number;
  name: string;
};

export type carryForwardTableDataType = {
  employeeId: string;
  name: string | JSX.Element;
  [key: string]: string | number | JSX.Element;
};
