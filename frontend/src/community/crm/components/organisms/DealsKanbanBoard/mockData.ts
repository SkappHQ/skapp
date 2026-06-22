import {
  CrmDealStageColorsEnum,
  CrmDealStageEnum,
  CrmIndustryEnum,
  CrmPriorityEnum
} from "~community/crm/enums/common";
import type {
  CrmDealBoardType,
  CrmDealStageType
} from "~community/crm/types/CommonTypes";

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

export const MOCK_DEALS: Record<number, CrmDealBoardType[]> = {
  1: [
    {
      id: 101,
      name: "Acme Corp Expansion",
      description: null,
      orderIndex: 1,
      stage: MOCK_STAGES[0],
      priority: CrmPriorityEnum.HIGH,
      amount: "12000",
      company: {
        id: 1,
        name: "Acme Corp",
        industry: CrmIndustryEnum.TECHNOLOGY_INFORMATION_AND_MEDIA,
        website: null,
        address: null,
        contactNumber: null,
        isDeleted: false
      },
      contact: {
        id: 1,
        name: "John Smith",
        email: "john@acme.com",
        contactNumber: null,
        lastContactAt: null,
        lastModifiedDate: "",
        company: null,
        owner: MOCK_OWNER,
        isDeleted: false
      },
      owner: MOCK_OWNER,
      taskCount: 0
    },
    {
      id: 102,
      name: "Beta Solutions Onboarding",
      description: null,
      orderIndex: 2,
      stage: MOCK_STAGES[0],
      priority: CrmPriorityEnum.LOW,
      amount: "4500",
      company: {
        id: 2,
        name: "Beta Solutions",
        industry: CrmIndustryEnum.PROFESSIONAL_SERVICES,
        website: null,
        address: null,
        contactNumber: null,
        isDeleted: false
      },
      contact: {
        id: 2,
        name: "Sara Lee",
        email: "sara@beta.com",
        contactNumber: null,
        lastContactAt: null,
        lastModifiedDate: "",
        company: null,
        owner: MOCK_OWNER,
        isDeleted: false
      },
      owner: MOCK_OWNER,
      taskCount: 1
    }
  ],
  2: [
    {
      id: 201,
      name: "Gamma Tech Upgrade",
      description: null,
      orderIndex: 1,
      stage: MOCK_STAGES[1],
      priority: CrmPriorityEnum.MEDIUM,
      amount: "29000",
      company: {
        id: 3,
        name: "Gamma Tech",
        industry: CrmIndustryEnum.TECHNOLOGY_INFORMATION_AND_MEDIA,
        website: null,
        address: null,
        contactNumber: null,
        isDeleted: false
      },
      contact: {
        id: 3,
        name: "Mike Chan",
        email: "mike@gamma.com",
        contactNumber: null,
        lastContactAt: null,
        lastModifiedDate: "",
        company: null,
        owner: MOCK_OWNER,
        isDeleted: false
      },
      owner: MOCK_OWNER,
      taskCount: 2
    }
  ],
  3: [
    {
      id: 301,
      name: "Delta Finance Suite",
      description: null,
      orderIndex: 1,
      stage: MOCK_STAGES[2],
      priority: CrmPriorityEnum.HIGH,
      amount: "55000",
      company: {
        id: 4,
        name: "Delta Finance",
        industry: CrmIndustryEnum.FINANCIAL_SERVICES,
        website: null,
        address: null,
        contactNumber: null,
        isDeleted: false
      },
      contact: {
        id: 4,
        name: "Emma Brown",
        email: "emma@delta.com",
        contactNumber: null,
        lastContactAt: null,
        lastModifiedDate: "",
        company: null,
        owner: MOCK_OWNER,
        isDeleted: false
      },
      owner: MOCK_OWNER,
      taskCount: 5
    }
  ],
  4: [],
  5: [
    {
      id: 501,
      name: "Omega Retail Deal",
      description: null,
      orderIndex: 1,
      stage: MOCK_STAGES[4],
      priority: CrmPriorityEnum.MEDIUM,
      amount: "18000",
      company: {
        id: 5,
        name: "Omega Retail",
        industry: CrmIndustryEnum.RETAIL,
        website: null,
        address: null,
        contactNumber: null,
        isDeleted: false
      },
      contact: {
        id: 5,
        name: "Tom White",
        email: "tom@omega.com",
        contactNumber: null,
        lastContactAt: null,
        lastModifiedDate: "",
        company: null,
        owner: MOCK_OWNER,
        isDeleted: false
      },
      owner: MOCK_OWNER,
      taskCount: 0
    }
  ],
  6: []
};
