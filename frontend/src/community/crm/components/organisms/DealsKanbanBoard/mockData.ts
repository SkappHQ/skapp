import {
  CrmDealStageColorsEnum,
  CrmDealStageEnum,
  CrmPriorityEnum
} from "~community/crm/enums/common";
import type { CrmBoardDealType } from "~community/crm/types/BoardTypes";
import type { CrmDealStageType } from "~community/crm/types/CommonTypes";

export const MOCK_STAGES: CrmDealStageType[] = [
  {
    id: 1,
    name: "Lead",
    color: CrmDealStageColorsEnum.PINK,
    orderIndex: 1,
    stageType: CrmDealStageEnum.INITIAL
  },
  {
    id: 2,
    name: "Qualified",
    color: CrmDealStageColorsEnum.TEAL,
    orderIndex: 2,
    stageType: CrmDealStageEnum.OPEN
  },
  {
    id: 3,
    name: "Demo scheduled",
    color: CrmDealStageColorsEnum.LAVENDER,
    orderIndex: 3,
    stageType: CrmDealStageEnum.OPEN
  },
  {
    id: 4,
    name: "Proposal sent",
    color: CrmDealStageColorsEnum.GOLD,
    orderIndex: 4,
    stageType: CrmDealStageEnum.OPEN
  },
  {
    id: 5,
    name: "Deal Won",
    color: CrmDealStageColorsEnum.LIME,
    orderIndex: 5,
    stageType: CrmDealStageEnum.WON
  },
  {
    id: 6,
    name: "Deal Lost",
    color: CrmDealStageColorsEnum.ROSEWOOD,
    orderIndex: 6,
    stageType: CrmDealStageEnum.LOST
  }
];

const MOCK_OWNER = {
  employeeId: 1,
  firstName: "Alice",
  lastName: "Johnson",
  authPic: null
};

export const MOCK_DEALS: Record<number, CrmBoardDealType[]> = {
  1: [
    {
      id: 101,
      name: "Acme Corp Expansion",
      orderIndex: "1",
      priority: CrmPriorityEnum.HIGH,
      amount: "12000",
      companyName: "Acme Corp",
      contactName: "John Smith",
      owner: MOCK_OWNER,
      taskCount: 0
    },
    {
      id: 102,
      name: "Beta Solutions Onboarding",
      orderIndex: "2",
      priority: CrmPriorityEnum.LOW,
      amount: "4500",
      companyName: "Beta Solutions",
      contactName: "Sara Lee",
      owner: MOCK_OWNER,
      taskCount: 1
    }
  ],
  2: [
    {
      id: 201,
      name: "Gamma Tech Upgrade",
      orderIndex: "1",
      priority: CrmPriorityEnum.MEDIUM,
      amount: "29000",
      companyName: "Gamma Tech",
      contactName: "Mike Chan",
      owner: MOCK_OWNER,
      taskCount: 2
    }
  ],
  3: [
    {
      id: 301,
      name: "Delta Finance Suite",
      orderIndex: "1",
      priority: CrmPriorityEnum.HIGH,
      amount: "55000",
      companyName: "Delta Finance",
      contactName: "Emma Brown",
      owner: MOCK_OWNER,
      taskCount: 5
    }
  ],
  4: [],
  5: [
    {
      id: 501,
      name: "Omega Retail Deal",
      orderIndex: "1",
      priority: CrmPriorityEnum.MEDIUM,
      amount: "18000",
      companyName: "Omega Retail",
      contactName: "Tom White",
      owner: MOCK_OWNER,
      taskCount: 0
    }
  ],
  6: []
};
