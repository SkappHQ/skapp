import { CrmDealStageEnum } from "~community/crm/enums/common";
import {
  CrmCompanyType,
  CrmContactType,
  CrmDealListItemType,
  CrmDealStageType,
  CrmPriorityType
} from "~community/crm/types/CommonTypes";

export const MOCK_DEAL_STAGES: CrmDealStageType[] = [
  {
    id: 1,
    name: "Prospecting",
    color: "#3B82F6",
    orderIndex: 0,
    stageType: CrmDealStageEnum.INITIAL
  },
  {
    id: 2,
    name: "Qualification",
    color: "#F59E0B",
    orderIndex: 1,
    stageType: CrmDealStageEnum.OPEN
  },
  {
    id: 3,
    name: "Proposal",
    color: "#8B5CF6",
    orderIndex: 2,
    stageType: CrmDealStageEnum.OPEN
  },
  {
    id: 4,
    name: "Negotiation",
    color: "#EC4899",
    orderIndex: 3,
    stageType: CrmDealStageEnum.OPEN
  },
  {
    id: 5,
    name: "Closed Won",
    color: "#10B981",
    orderIndex: 4,
    stageType: CrmDealStageEnum.WON
  },
  {
    id: 6,
    name: "Closed Lost",
    color: "#EF4444",
    orderIndex: 5,
    stageType: CrmDealStageEnum.LOST
  }
];

export const MOCK_PRIORITIES: CrmPriorityType[] = [
  { id: 1, name: "Low", orderIndex: 0 },
  { id: 2, name: "Medium", orderIndex: 1 },
  { id: 3, name: "High", orderIndex: 2 },
  { id: 4, name: "Critical", orderIndex: 3 }
];

export const MOCK_COMPANIES: CrmCompanyType[] = [
  {
    id: 1,
    name: "Acme Corporation",
    industry: "Technology",
    website: "https://acme.com",
    address: "123 Main St, San Francisco, CA",
    contactNumber: "+1-555-0100",
    isDeleted: false
  },
  {
    id: 2,
    name: "Globex Inc.",
    industry: "Manufacturing",
    website: "https://globex.com",
    address: "456 Industrial Blvd, Chicago, IL",
    contactNumber: "+1-555-0200",
    isDeleted: false
  },
  {
    id: 3,
    name: "Initech Solutions",
    industry: "Finance",
    website: "https://initech.com",
    address: "789 Finance Ave, New York, NY",
    contactNumber: "+1-555-0300",
    isDeleted: false
  },
  {
    id: 4,
    name: "Umbrella Corp",
    industry: "Pharmaceutical",
    website: "https://umbrella.com",
    address: "321 Research Pkwy, Boston, MA",
    contactNumber: "+1-555-0400",
    isDeleted: false
  },
  {
    id: 5,
    name: "Stark Industries",
    industry: "Defense",
    website: "https://stark.com",
    address: "1 Stark Tower, New York, NY",
    contactNumber: "+1-555-0500",
    isDeleted: false
  }
];

export const MOCK_CONTACTS: CrmContactType[] = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@acme.com",
    contactNumber: "+1-555-1001",
    lastContactAt: "2026-05-01T10:00:00Z",
    company: MOCK_COMPANIES[0],
    owner: { employeeId: 1, firstName: "John", lastName: "Smith", authPic: null },
    isDeleted: false
  },
  {
    id: 2,
    name: "Bob Martinez",
    email: "bob@globex.com",
    contactNumber: "+1-555-1002",
    lastContactAt: "2026-04-28T09:00:00Z",
    company: MOCK_COMPANIES[1],
    owner: { employeeId: 2, firstName: "Sarah", lastName: "Lee", authPic: null },
    isDeleted: false
  },
  {
    id: 3,
    name: "Carol White",
    email: "carol@initech.com",
    contactNumber: "+1-555-1003",
    lastContactAt: "2026-05-05T14:00:00Z",
    company: MOCK_COMPANIES[2],
    owner: { employeeId: 1, firstName: "John", lastName: "Smith", authPic: null },
    isDeleted: false
  },
  {
    id: 4,
    name: "David Brown",
    email: "david@umbrella.com",
    contactNumber: "+1-555-1004",
    lastContactAt: "2026-05-10T11:00:00Z",
    company: MOCK_COMPANIES[3],
    owner: { employeeId: 3, firstName: "Mike", lastName: "Taylor", authPic: null },
    isDeleted: false
  },
  {
    id: 5,
    name: "Eva Garcia",
    email: "eva@stark.com",
    contactNumber: "+1-555-1005",
    lastContactAt: "2026-05-12T16:00:00Z",
    company: MOCK_COMPANIES[4],
    owner: { employeeId: 2, firstName: "Sarah", lastName: "Lee", authPic: null },
    isDeleted: false
  }
];

export const MOCK_DEALS: CrmDealListItemType[] = [
  {
    id: 1,
    name: "Acme Enterprise License",
    stageId: 5,
    stageName: "Closed Won",
    stageColor: "#10B981",
    priorityId: 3,
    priorityName: "High",
    closingAt: "2026-04-30T00:00:00Z",
    amount: "125000",
    companyId: 1,
    companyName: "Acme Corporation",
    contactId: 1,
    contactName: "Alice Johnson",
    ownerId: 1,
    ownerName: "John Smith",
    openTaskCount: 1,
    overdueTaskCount: 0
  },
  {
    id: 2,
    name: "Globex Manufacturing Suite",
    stageId: 3,
    stageName: "Proposal",
    stageColor: "#8B5CF6",
    priorityId: 2,
    priorityName: "Medium",
    closingAt: "2026-06-15T00:00:00Z",
    amount: "87500",
    companyId: 2,
    companyName: "Globex Inc.",
    contactId: 2,
    contactName: "Bob Martinez",
    ownerId: 2,
    ownerName: "Sarah Lee",
    openTaskCount: 2,
    overdueTaskCount: 1
  },
  {
    id: 3,
    name: "Initech Fintech Integration",
    stageId: 4,
    stageName: "Negotiation",
    stageColor: "#EC4899",
    priorityId: 4,
    priorityName: "Critical",
    closingAt: "2026-05-31T00:00:00Z",
    amount: "210000",
    companyId: 3,
    companyName: "Initech Solutions",
    contactId: 3,
    contactName: "Carol White",
    ownerId: 1,
    ownerName: "John Smith",
    openTaskCount: 3,
    overdueTaskCount: 2
  },
  {
    id: 4,
    name: "Umbrella Lab Software",
    stageId: 2,
    stageName: "Qualification",
    stageColor: "#F59E0B",
    priorityId: 2,
    priorityName: "Medium",
    closingAt: "2026-07-20T00:00:00Z",
    amount: "45000",
    companyId: 4,
    companyName: "Umbrella Corp",
    contactId: 4,
    contactName: "David Brown",
    ownerId: 3,
    ownerName: "Mike Taylor",
    openTaskCount: 0,
    overdueTaskCount: 0
  },
  {
    id: 5,
    name: "Stark Defense Platform",
    stageId: 1,
    stageName: "Prospecting",
    stageColor: "#3B82F6",
    priorityId: 3,
    priorityName: "High",
    closingAt: "2026-08-01T00:00:00Z",
    amount: "500000",
    companyId: 5,
    companyName: "Stark Industries",
    contactId: 5,
    contactName: "Eva Garcia",
    ownerId: 2,
    ownerName: "Sarah Lee",
    openTaskCount: 2,
    overdueTaskCount: 0
  },
  {
    id: 6,
    name: "Acme Cloud Upgrade",
    stageId: 2,
    stageName: "Qualification",
    stageColor: "#F59E0B",
    priorityId: 1,
    priorityName: "Low",
    closingAt: "2026-09-10T00:00:00Z",
    amount: "32000",
    companyId: 1,
    companyName: "Acme Corporation",
    contactId: 1,
    contactName: "Alice Johnson",
    ownerId: 1,
    ownerName: "John Smith",
    openTaskCount: 1,
    overdueTaskCount: 0
  },
  {
    id: 7,
    name: "Globex Supply Chain Tool",
    stageId: 6,
    stageName: "Closed Lost",
    stageColor: "#EF4444",
    priorityId: 2,
    priorityName: "Medium",
    closingAt: "2026-03-01T00:00:00Z",
    amount: "60000",
    companyId: 2,
    companyName: "Globex Inc.",
    contactId: 2,
    contactName: "Bob Martinez",
    ownerId: 2,
    ownerName: "Sarah Lee",
    openTaskCount: 0,
    overdueTaskCount: 0
  },
  {
    id: 8,
    name: "Initech Risk Analytics",
    stageId: 3,
    stageName: "Proposal",
    stageColor: "#8B5CF6",
    priorityId: 3,
    priorityName: "High",
    closingAt: "2026-06-30T00:00:00Z",
    amount: "95000",
    companyId: 3,
    companyName: "Initech Solutions",
    contactId: 3,
    contactName: "Carol White",
    ownerId: 3,
    ownerName: "Mike Taylor",
    openTaskCount: 2,
    overdueTaskCount: 1
  },
  {
    id: 9,
    name: "Umbrella Clinical Trials System",
    stageId: 4,
    stageName: "Negotiation",
    stageColor: "#EC4899",
    priorityId: 4,
    priorityName: "Critical",
    closingAt: "2026-05-25T00:00:00Z",
    amount: "310000",
    companyId: 4,
    companyName: "Umbrella Corp",
    contactId: 4,
    contactName: "David Brown",
    ownerId: 1,
    ownerName: "John Smith",
    openTaskCount: 4,
    overdueTaskCount: 2
  },
  {
    id: 10,
    name: "Stark Weapons Simulation",
    stageId: 5,
    stageName: "Closed Won",
    stageColor: "#10B981",
    priorityId: 4,
    priorityName: "Critical",
    closingAt: "2026-04-15T00:00:00Z",
    amount: "750000",
    companyId: 5,
    companyName: "Stark Industries",
    contactId: 5,
    contactName: "Eva Garcia",
    ownerId: 2,
    ownerName: "Sarah Lee",
    openTaskCount: 1,
    overdueTaskCount: 0
  },
  {
    id: 11,
    name: "Acme HR Platform",
    stageId: 1,
    stageName: "Prospecting",
    stageColor: "#3B82F6",
    priorityId: 1,
    priorityName: "Low",
    closingAt: "2026-10-01T00:00:00Z",
    amount: null,
    companyId: 1,
    companyName: "Acme Corporation",
    contactId: 1,
    contactName: "Alice Johnson",
    ownerId: 3,
    ownerName: "Mike Taylor",
    openTaskCount: 0,
    overdueTaskCount: 0
  },
  {
    id: 12,
    name: "Globex ERP Rollout",
    stageId: 3,
    stageName: "Proposal",
    stageColor: "#8B5CF6",
    priorityId: 3,
    priorityName: "High",
    closingAt: "2026-07-31T00:00:00Z",
    amount: "185000",
    companyId: 2,
    companyName: "Globex Inc.",
    contactId: 2,
    contactName: "Bob Martinez",
    ownerId: 1,
    ownerName: "John Smith",
    openTaskCount: 2,
    overdueTaskCount: 0
  }
];

export function filterAndPaginateMockDeals(
  page: number,
  size: number,
  sortOrder: string,
  searchKeyword?: string,
  stageId?: number,
  priorityId?: number
) {
  let filtered = [...MOCK_DEALS];

  if (searchKeyword) {
    const kw = searchKeyword.toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.name.toLowerCase().includes(kw) ||
        (d.companyName ?? "").toLowerCase().includes(kw) ||
        d.contactName.toLowerCase().includes(kw) ||
        d.ownerName.toLowerCase().includes(kw) ||
        d.stageName.toLowerCase().includes(kw)
    );
  }

  if (stageId !== undefined) {
    filtered = filtered.filter((d) => d.stageId === stageId);
  }

  if (priorityId !== undefined) {
    filtered = filtered.filter((d) => d.priorityId === priorityId);
  }

  filtered.sort((a, b) => {
    if (sortOrder === "ASC") {
      // Oldest first: sort by id ascending
      return a.id - b.id;
    }
    // Default / Newest first: sort by priority DESC (null last), then id DESC
    const pa = a.priorityId ?? -1;
    const pb = b.priorityId ?? -1;
    if (pb !== pa) return pb - pa;
    return b.id - a.id;
  });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / size);
  const items = filtered.slice(page * size, page * size + size);

  return { items, currentPage: page, totalItems, totalPages };
}
