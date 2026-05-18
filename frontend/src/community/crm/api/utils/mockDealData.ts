import { CrmDealStageEnum } from "~community/crm/enums/common";
import {
  CrmCompanyType,
  CrmContactType,
  CrmDealListItemType,
  CrmDealStageType
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


export const MOCK_COMPANIES: CrmCompanyType[] = [
  {
    id: 1,
    name: "Acme Corporation",
    industry: "Technology",
    website: "https://www.acme.example",
    address: "100 Market Street",
    contactNumber: "+14155550100",
    isDeleted: false
  },
  {
    id: 2,
    name: "Globex Ltd",
    industry: "Manufacturing",
    website: "https://www.globex.example",
    address: "42 Industrial Avenue",
    contactNumber: "+442071230001",
    isDeleted: false
  },
  {
    id: 3,
    name: "Initech Solutions",
    industry: "Software",
    website: "https://www.initech.example",
    address: "8 Innovation Drive",
    contactNumber: "+12125550125",
    isDeleted: false
  },
  {
    id: 4,
    name: "Umbrella Health",
    industry: "Healthcare",
    website: "https://www.umbrella.example",
    address: "75 Wellness Road",
    contactNumber: "+61355501010",
    isDeleted: false
  },
  {
    id: 5,
    name: "Stark Industries",
    industry: "Engineering",
    website: "https://www.stark.example",
    address: "200 Arc Reactor Way",
    contactNumber: "+13105550177",
    isDeleted: false
  }
];

export const MOCK_CONTACTS: CrmContactType[] = [
  { id: 1,  name: "Alice Johnson",      email: "alice.johnson@example.com",      contactNumber: "+14155550111", lastContactAt: "2026-05-08T11:55:28Z", company: MOCK_COMPANIES[0], owner: { employeeId: 3, firstName: "CRM",   lastName: "Admin",          authPic: null }, isDeleted: false },
  { id: 2,  name: "Brian Carter",       email: "brian.carter@example.com",       contactNumber: "+442071230002", lastContactAt: "2026-05-08T11:55:28Z", company: MOCK_COMPANIES[1], owner: { employeeId: 4, firstName: "CRM",   lastName: "Manager",        authPic: null }, isDeleted: false },
  { id: 3,  name: "Caroline Smith",     email: "caroline.smith@example.com",     contactNumber: "+12125550126", lastContactAt: "2026-05-08T11:55:28Z", company: MOCK_COMPANIES[2], owner: { employeeId: 5, firstName: "CRM",   lastName: "Representative", authPic: null }, isDeleted: false },
  { id: 4,  name: "Daniel Lee",         email: "daniel.lee@example.com",         contactNumber: "+61355501011", lastContactAt: "2026-05-08T11:55:28Z", company: MOCK_COMPANIES[3], owner: { employeeId: 4, firstName: "CRM",   lastName: "Manager",        authPic: null }, isDeleted: false },
  { id: 5,  name: "Emma Wilson",        email: "emma.wilson@example.com",        contactNumber: "+13105550178", lastContactAt: "2026-05-08T11:55:28Z", company: MOCK_COMPANIES[4], owner: { employeeId: 5, firstName: "CRM",   lastName: "Representative", authPic: null }, isDeleted: false },
  { id: 10, name: "John Doe",           email: "john.doe@example.com",           contactNumber: "+14155550199", lastContactAt: "2026-05-14T11:35:41Z", company: MOCK_COMPANIES[0], owner: { employeeId: 3, firstName: "CRM",   lastName: "Admin",          authPic: null }, isDeleted: false },
  { id: 12, name: "Sarah Martinez",     email: "sarah.martinez@techcorp.com",    contactNumber: "+14155551001", lastContactAt: "2026-05-01T09:00:00Z", company: MOCK_COMPANIES[0], owner: { employeeId: 3, firstName: "CRM",   lastName: "Admin",          authPic: null }, isDeleted: false },
  { id: 13, name: "Michael Chen",       email: "michael.chen@techcorp.com",      contactNumber: "+14155551002", lastContactAt: "2026-05-02T10:30:00Z", company: MOCK_COMPANIES[0], owner: { employeeId: 3, firstName: "CRM",   lastName: "Admin",          authPic: null }, isDeleted: false },
  { id: 14, name: "Jennifer Wu",        email: "jennifer.wu@techcorp.com",       contactNumber: "+14155551003", lastContactAt: "2026-05-03T14:15:00Z", company: MOCK_COMPANIES[0], owner: { employeeId: 4, firstName: "CRM",   lastName: "Manager",        authPic: null }, isDeleted: false },
  { id: 15, name: "David Park",         email: "david.park@techcorp.com",        contactNumber: "+14155551004", lastContactAt: "2026-05-04T11:20:00Z", company: MOCK_COMPANIES[0], owner: { employeeId: 4, firstName: "CRM",   lastName: "Manager",        authPic: null }, isDeleted: false },
  { id: 16, name: "Lisa Thompson",      email: "lisa.thompson@techcorp.com",     contactNumber: "+14155551005", lastContactAt: "2026-05-05T16:45:00Z", company: MOCK_COMPANIES[0], owner: { employeeId: 5, firstName: "CRM",   lastName: "Representative", authPic: null }, isDeleted: false },
  { id: 17, name: "Robert Kim",         email: "robert.kim@innovatech.com",      contactNumber: "+14155551006", lastContactAt: "2026-05-06T08:30:00Z", company: MOCK_COMPANIES[1], owner: { employeeId: 3, firstName: "CRM",   lastName: "Admin",          authPic: null }, isDeleted: false },
  { id: 18, name: "Amanda Lee",         email: "amanda.lee@innovatech.com",      contactNumber: "+14155551007", lastContactAt: "2026-05-07T13:00:00Z", company: MOCK_COMPANIES[1], owner: { employeeId: 3, firstName: "CRM",   lastName: "Admin",          authPic: null }, isDeleted: false },
  { id: 19, name: "James Wilson",       email: "james.wilson@innovatech.com",    contactNumber: "+14155551008", lastContactAt: "2026-05-08T15:30:00Z", company: MOCK_COMPANIES[1], owner: { employeeId: 4, firstName: "CRM",   lastName: "Manager",        authPic: null }, isDeleted: false },
  { id: 20, name: "Maria Garcia",       email: "maria.garcia@innovatech.com",    contactNumber: "+14155551009", lastContactAt: "2026-05-09T09:45:00Z", company: MOCK_COMPANIES[1], owner: { employeeId: 4, firstName: "CRM",   lastName: "Manager",        authPic: null }, isDeleted: false },
  { id: 22, name: "Emily Brown",        email: "emily.brown@globalsys.com",      contactNumber: "+14155551011", lastContactAt: "2026-05-11T10:00:00Z", company: MOCK_COMPANIES[2], owner: { employeeId: 3, firstName: "CRM",   lastName: "Admin",          authPic: null }, isDeleted: false },
  { id: 23, name: "Daniel White",       email: "daniel.white@globalsys.com",     contactNumber: "+14155551012", lastContactAt: "2026-05-12T14:30:00Z", company: MOCK_COMPANIES[2], owner: { employeeId: 3, firstName: "CRM",   lastName: "Admin",          authPic: null }, isDeleted: false },
  { id: 24, name: "Jessica Taylor",     email: "jessica.taylor@globalsys.com",   contactNumber: "+14155551013", lastContactAt: "2026-05-13T11:45:00Z", company: MOCK_COMPANIES[2], owner: { employeeId: 4, firstName: "CRM",   lastName: "Manager",        authPic: null }, isDeleted: false },
  { id: 27, name: "Matthew Jackson",    email: "matthew.jackson@datasol.com",    contactNumber: "+14155551016", lastContactAt: "2026-04-16T13:45:00Z", company: MOCK_COMPANIES[3], owner: { employeeId: 3, firstName: "CRM",   lastName: "Admin",          authPic: null }, isDeleted: false },
  { id: 28, name: "Melissa Harris",     email: "melissa.harris@datasol.com",     contactNumber: "+14155551017", lastContactAt: "2026-04-17T10:30:00Z", company: MOCK_COMPANIES[3], owner: { employeeId: 3, firstName: "CRM",   lastName: "Admin",          authPic: null }, isDeleted: false },
  { id: 32, name: "Rachel Robinson",    email: "rachel.robinson@fintech.com",    contactNumber: "+14155551021", lastContactAt: "2026-04-21T09:30:00Z", company: MOCK_COMPANIES[4], owner: { employeeId: 3, firstName: "CRM",   lastName: "Admin",          authPic: null }, isDeleted: false },
  { id: 33, name: "Kevin Clark",        email: "kevin.clark@fintech.com",        contactNumber: "+14155551022", lastContactAt: "2026-04-22T12:00:00Z", company: MOCK_COMPANIES[4], owner: { employeeId: 3, firstName: "CRM",   lastName: "Admin",          authPic: null }, isDeleted: false },
  { id: 34, name: "Stephanie Rodriguez",email: "stephanie.rodriguez@fintech.com",contactNumber: "+14155551023", lastContactAt: "2026-04-23T15:30:00Z", company: MOCK_COMPANIES[4], owner: { employeeId: 4, firstName: "CRM",   lastName: "Manager",        authPic: null }, isDeleted: false }
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
