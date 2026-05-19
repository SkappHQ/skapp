import {
  ButtonV2,
  Dropdown,
  InputField,
  SidePanel,
  TextArea
} from "@rootcodelabs/skapp-ui";
import type { DropdownOption } from "@rootcodelabs/skapp-ui/dist/types/components/molecules/Dropdown/Dropdown";
import { useFormik } from "formik";
import {
  FC,
  ReactNode,
  useEffect,
  useMemo,
  useState
} from "react";
import * as Yup from "yup";
import { useShallow } from "zustand/react/shallow";

import PlusIcon from "~community/common/assets/Icons/PlusIcon";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useCreateDeal, useGetCrmCompanies, useGetCrmContacts, useGetDealStages } from "~community/crm/api/crmDealApi";
import { CrmDealStageEnum } from "~community/crm/enums/common";
import CompanyPopupSearch from "~community/crm/components/molecules/CompanyPopupSearch/CompanyPopupSearch";
import ContactPopupSearch from "~community/crm/components/molecules/ContactPopupSearch/ContactPopupSearch";
import PeoplePopupSearch from "~community/crm/components/molecules/PeoplePopupSearch/PeoplePopupSearch";
import PriorityDropdown from "~community/crm/components/molecules/PriorityDropdown/PriorityDropdown";
import { CrmCompanyType, CrmContactType, CrmOwnerType } from "~community/crm/types/CommonTypes";
import { useGetSearchedEmployees } from "~community/people/api/PeopleApi";
import { useAppStore } from "~store/store";

// ---------------------------------------------------------------------------
// Demo data — remove once real data is available
// ---------------------------------------------------------------------------
const DEMO_OWNER: CrmOwnerType = { employeeId: 0, firstName: "Demo", lastName: null, authPic: null };

const DEMO_CONTACTS: CrmContactType[] = [
  { id: 1,   name: "Alice Johnson",        email: "alice.johnson@example.com",         contactNumber: "+14155550111",  lastContactAt: "2026-05-08 11:55:28", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 2,   name: "Brian Carter",         email: "brian.carter@example.com",          contactNumber: "+442071230002", lastContactAt: "2026-05-08 11:55:28", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 3,   name: "Caroline Smith",       email: "caroline.smith@example.com",        contactNumber: "+12125550126",  lastContactAt: "2026-05-08 11:55:28", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 4,   name: "Daniel Lee",           email: "daniel.lee@example.com",            contactNumber: "+61355501011",  lastContactAt: "2026-05-08 11:55:28", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 5,   name: "Emma Wilson",          email: "emma.wilson@example.com",           contactNumber: "+13105550178",  lastContactAt: "2026-05-08 11:55:28", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 6,   name: "xzc sda d",            email: "dev12222@gmail.com",                contactNumber: "+94343252343243", lastContactAt: null, company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 7,   name: "zxczxc",               email: "dev1@gmaxzcil.com",                 contactNumber: null,            lastContactAt: null, company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 8,   name: "asdsad",               email: "sadsad@sadsd.com",                  contactNumber: "+942131231231", lastContactAt: null, company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 9,   name: "asdsad",               email: "devxzc1@gmail.com",                 contactNumber: "+942131231231", lastContactAt: null, company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 10,  name: "John Doe",             email: "john.doe@example.com",              contactNumber: "+14155550199",  lastContactAt: null, company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 11,  name: "John Doef",            email: "john.rrrdoe@example.com",           contactNumber: "+14155550199",  lastContactAt: null, company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 12,  name: "Sarah Martinez",       email: "sarah.martinez@techcorp.com",       contactNumber: "+14155551001",  lastContactAt: "2026-05-01 09:00:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 13,  name: "Michael Chen",         email: "michael.chen@techcorp.com",         contactNumber: "+14155551002",  lastContactAt: "2026-05-02 10:30:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 14,  name: "Jennifer Wu",          email: "jennifer.wu@techcorp.com",          contactNumber: "+14155551003",  lastContactAt: "2026-05-03 14:15:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 15,  name: "David Park",           email: "david.park@techcorp.com",           contactNumber: "+14155551004",  lastContactAt: "2026-05-04 11:20:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 16,  name: "Lisa Thompson",        email: "lisa.thompson@techcorp.com",        contactNumber: "+14155551005",  lastContactAt: "2026-05-05 16:45:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 17,  name: "Robert Kim",           email: "robert.kim@innovatech.com",         contactNumber: "+14155551006",  lastContactAt: "2026-05-06 08:30:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 18,  name: "Amanda Lee",           email: "amanda.lee@innovatech.com",         contactNumber: "+14155551007",  lastContactAt: "2026-05-07 13:00:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 19,  name: "James Wilson",         email: "james.wilson@innovatech.com",       contactNumber: "+14155551008",  lastContactAt: "2026-05-08 15:30:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 20,  name: "Maria Garcia",         email: "maria.garcia@innovatech.com",       contactNumber: "+14155551009",  lastContactAt: "2026-05-09 09:45:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 21,  name: "Thomas Anderson",      email: "thomas.anderson@innovatech.com",    contactNumber: "+14155551010",  lastContactAt: "2026-05-10 12:15:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 22,  name: "Emily Brown",          email: "emily.brown@globalsys.com",         contactNumber: "+14155551011",  lastContactAt: "2026-05-11 10:00:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 23,  name: "Daniel White",         email: "daniel.white@globalsys.com",        contactNumber: "+14155551012",  lastContactAt: "2026-05-12 14:30:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 24,  name: "Jessica Taylor",       email: "jessica.taylor@globalsys.com",      contactNumber: "+14155551013",  lastContactAt: "2026-05-13 11:45:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 25,  name: "Christopher Moore",    email: "christopher.moore@globalsys.com",   contactNumber: "+14155551014",  lastContactAt: "2026-04-14 16:00:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 26,  name: "Ashley Martinez",      email: "ashley.martinez@globalsys.com",     contactNumber: "+14155551015",  lastContactAt: "2026-04-15 09:15:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 27,  name: "Matthew Jackson",      email: "matthew.jackson@datasol.com",       contactNumber: "+14155551016",  lastContactAt: "2026-04-16 13:45:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 28,  name: "Melissa Harris",       email: "melissa.harris@datasol.com",        contactNumber: "+14155551017",  lastContactAt: "2026-04-17 10:30:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 29,  name: "Joshua Martin",        email: "joshua.martin@datasol.com",         contactNumber: "+14155551018",  lastContactAt: "2026-04-18 15:00:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 30,  name: "Michelle Thompson",    email: "michelle.thompson@datasol.com",     contactNumber: "+14155551019",  lastContactAt: "2026-04-19 11:15:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 31,  name: "Andrew Garcia",        email: "andrew.garcia@datasol.com",         contactNumber: "+14155551020",  lastContactAt: "2026-04-20 14:45:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 32,  name: "Rachel Robinson",      email: "rachel.robinson@fintech.com",       contactNumber: "+14155551021",  lastContactAt: "2026-04-21 09:30:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 33,  name: "Kevin Clark",          email: "kevin.clark@fintech.com",           contactNumber: "+14155551022",  lastContactAt: "2026-04-22 12:00:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 34,  name: "Stephanie Rodriguez",  email: "stephanie.rodriguez@fintech.com",   contactNumber: "+14155551023",  lastContactAt: "2026-04-23 15:30:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 35,  name: "Brian Lewis",          email: "brian.lewis@fintech.com",           contactNumber: "+14155551024",  lastContactAt: "2026-04-24 10:45:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 36,  name: "Nicole Walker",        email: "nicole.walker@fintech.com",         contactNumber: "+14155551025",  lastContactAt: "2026-04-25 13:15:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 37,  name: "Justin Hall",          email: "justin.hall@banking.io",            contactNumber: "+14155551026",  lastContactAt: "2026-04-26 16:45:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 38,  name: "Heather Allen",        email: "heather.allen@banking.io",          contactNumber: "+14155551027",  lastContactAt: "2026-04-27 09:00:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 39,  name: "Ryan Young",           email: "ryan.young@banking.io",             contactNumber: "+14155551028",  lastContactAt: "2026-04-28 11:30:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 40,  name: "Lauren King",          email: "lauren.king@banking.io",            contactNumber: "+14155551029",  lastContactAt: "2026-04-29 14:00:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 41,  name: "Brandon Wright",       email: "brandon.wright@banking.io",         contactNumber: "+14155551030",  lastContactAt: "2026-04-30 16:30:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 42,  name: "Kimberly Lopez",       email: "kimberly.lopez@investment.com",     contactNumber: "+14155551031",  lastContactAt: "2026-03-01 08:45:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 43,  name: "Jonathan Hill",        email: "jonathan.hill@investment.com",      contactNumber: "+14155551032",  lastContactAt: "2026-03-02 12:15:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 44,  name: "Sara Scott",           email: "sara.scott@investment.com",         contactNumber: "+14155551033",  lastContactAt: "2026-03-03 15:45:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 45,  name: "Tyler Green",          email: "tyler.green@investment.com",        contactNumber: "+14155551034",  lastContactAt: "2026-03-04 09:30:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 46,  name: "Amber Adams",          email: "amber.adams@investment.com",        contactNumber: "+14155551035",  lastContactAt: "2026-03-05 13:00:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 47,  name: "Aaron Baker",          email: "aaron.baker@wealth.com",            contactNumber: "+14155551036",  lastContactAt: "2026-03-06 10:15:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 48,  name: "Crystal Nelson",       email: "crystal.nelson@wealth.com",         contactNumber: "+14155551037",  lastContactAt: "2026-03-07 14:45:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 49,  name: "Eric Carter",          email: "eric.carter@wealth.com",            contactNumber: "+14155551038",  lastContactAt: "2026-03-08 11:00:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 50,  name: "Danielle Mitchell",    email: "danielle.mitchell@wealth.com",      contactNumber: "+14155551039",  lastContactAt: "2026-03-09 15:30:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 51,  name: "Gregory Perez",        email: "gregory.perez@wealth.com",          contactNumber: "+14155551040",  lastContactAt: "2026-03-10 09:45:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 52,  name: "Angela Roberts",       email: "angela.roberts@healthtech.com",     contactNumber: "+14155551041",  lastContactAt: "2026-03-11 12:30:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 53,  name: "Nathan Turner",        email: "nathan.turner@healthtech.com",      contactNumber: "+14155551042",  lastContactAt: "2026-03-12 16:00:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 54,  name: "Rebecca Phillips",     email: "rebecca.phillips@healthtech.com",   contactNumber: "+14155551043",  lastContactAt: "2026-03-13 10:30:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 55,  name: "Austin Campbell",      email: "austin.campbell@healthtech.com",    contactNumber: "+14155551044",  lastContactAt: "2026-03-14 14:00:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 56,  name: "Natalie Parker",       email: "natalie.parker@healthtech.com",     contactNumber: "+14155551045",  lastContactAt: "2026-03-15 11:15:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 57,  name: "Samuel Evans",         email: "samuel.evans@medisys.com",          contactNumber: "+14155551046",  lastContactAt: "2026-03-16 15:45:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 58,  name: "Victoria Edwards",     email: "victoria.edwards@medisys.com",      contactNumber: "+14155551047",  lastContactAt: "2026-03-17 09:00:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 59,  name: "Jordan Collins",       email: "jordan.collins@medisys.com",        contactNumber: "+14155551048",  lastContactAt: "2026-03-18 12:30:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 60,  name: "Brittany Stewart",     email: "brittany.stewart@medisys.com",      contactNumber: "+14155551049",  lastContactAt: "2026-03-19 16:00:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 61,  name: "Jeremy Sanchez",       email: "jeremy.sanchez@medisys.com",        contactNumber: "+14155551050",  lastContactAt: "2026-03-20 10:15:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 62,  name: "Courtney Morris",      email: "courtney.morris@pharma.com",        contactNumber: "+14155551051",  lastContactAt: "2026-03-21 13:45:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 63,  name: "Adrian Rogers",        email: "adrian.rogers@pharma.com",          contactNumber: "+14155551052",  lastContactAt: "2026-03-22 11:30:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 64,  name: "Vanessa Reed",         email: "vanessa.reed@pharma.com",           contactNumber: "+14155551053",  lastContactAt: "2026-03-23 15:00:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 65,  name: "Marcus Cook",          email: "marcus.cook@pharma.com",            contactNumber: "+14155551054",  lastContactAt: "2026-03-24 09:45:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 66,  name: "Cassandra Morgan",     email: "cassandra.morgan@pharma.com",       contactNumber: "+14155551055",  lastContactAt: "2026-03-25 14:15:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 67,  name: "Derek Bell",           email: "derek.bell@biotech.com",            contactNumber: "+14155551056",  lastContactAt: "2026-02-26 10:00:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 68,  name: "Samantha Murphy",      email: "samantha.murphy@biotech.com",       contactNumber: "+14155551057",  lastContactAt: "2026-02-27 13:30:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 69,  name: "Alexander Bailey",     email: "alexander.bailey@biotech.com",      contactNumber: "+14155551058",  lastContactAt: "2026-02-28 16:45:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 70,  name: "Hannah Rivera",        email: "hannah.rivera@biotech.com",         contactNumber: "+14155551059",  lastContactAt: "2026-02-01 11:00:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 71,  name: "Trevor Cooper",        email: "trevor.cooper@biotech.com",         contactNumber: "+14155551060",  lastContactAt: "2026-02-02 14:30:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 72,  name: "Miranda Richardson",   email: "miranda.richardson@ecommerce.com",  contactNumber: "+14155551061",  lastContactAt: "2026-02-03 09:15:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 73,  name: "Kyle Cox",             email: "kyle.cox@ecommerce.com",            contactNumber: "+14155551062",  lastContactAt: "2026-02-04 12:45:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 74,  name: "Chelsea Howard",       email: "chelsea.howard@ecommerce.com",      contactNumber: "+14155551063",  lastContactAt: "2026-02-05 16:15:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 75,  name: "Dylan Ward",           email: "dylan.ward@ecommerce.com",          contactNumber: "+14155551064",  lastContactAt: "2026-02-06 10:30:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 76,  name: "Kristen Torres",       email: "kristen.torres@ecommerce.com",      contactNumber: "+14155551065",  lastContactAt: "2026-02-07 14:00:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 77,  name: "Blake Peterson",       email: "blake.peterson@retail.com",         contactNumber: "+14155551066",  lastContactAt: "2026-02-08 11:45:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 78,  name: "Alexis Gray",          email: "alexis.gray@retail.com",            contactNumber: "+14155551067",  lastContactAt: "2026-02-09 15:15:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 79,  name: "Connor Ramirez",       email: "connor.ramirez@retail.com",         contactNumber: "+14155551068",  lastContactAt: "2026-02-10 09:30:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 80,  name: "Megan James",          email: "megan.james@retail.com",            contactNumber: "+14155551069",  lastContactAt: "2026-02-11 13:00:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 81,  name: "Seth Watson",          email: "seth.watson@retail.com",            contactNumber: "+14155551070",  lastContactAt: "2026-02-12 16:30:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 82,  name: "Olivia Brooks",        email: "olivia.brooks@shopping.com",        contactNumber: "+14155551071",  lastContactAt: "2026-02-13 10:45:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 83,  name: "Chase Kelly",          email: "chase.kelly@shopping.com",          contactNumber: "+14155551072",  lastContactAt: "2026-02-14 14:15:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 84,  name: "Julia Sanders",        email: "julia.sanders@shopping.com",        contactNumber: "+14155551073",  lastContactAt: "2026-02-15 11:30:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 85,  name: "Cameron Price",        email: "cameron.price@shopping.com",        contactNumber: "+14155551074",  lastContactAt: "2026-02-16 15:00:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 86,  name: "Destiny Bennett",      email: "destiny.bennett@shopping.com",      contactNumber: "+14155551075",  lastContactAt: "2026-02-17 09:45:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 87,  name: "Evan Wood",            email: "evan.wood@marketplace.com",         contactNumber: "+14155551076",  lastContactAt: "2026-02-18 13:15:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 88,  name: "Sophia Barnes",        email: "sophia.barnes@marketplace.com",     contactNumber: "+14155551077",  lastContactAt: "2026-02-19 16:45:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 89,  name: "Ian Ross",             email: "ian.ross@marketplace.com",          contactNumber: "+14155551078",  lastContactAt: "2026-02-20 10:00:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 90,  name: "Paige Henderson",      email: "paige.henderson@marketplace.com",   contactNumber: "+14155551079",  lastContactAt: "2026-02-21 14:30:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 91,  name: "Colin Coleman",        email: "colin.coleman@marketplace.com",     contactNumber: "+14155551080",  lastContactAt: "2026-02-22 11:15:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 92,  name: "Abigail Jenkins",      email: "abigail.jenkins@manufac.com",       contactNumber: "+14155551081",  lastContactAt: "2026-02-23 15:45:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 93,  name: "Xavier Perry",         email: "xavier.perry@manufac.com",          contactNumber: "+14155551082",  lastContactAt: "2026-02-24 09:00:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 94,  name: "Mackenzie Powell",     email: "mackenzie.powell@manufac.com",      contactNumber: "+14155551083",  lastContactAt: "2026-02-25 12:30:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 95,  name: "Hunter Long",          email: "hunter.long@manufac.com",           contactNumber: "+14155551084",  lastContactAt: "2026-02-26 16:00:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 96,  name: "Jasmine Patterson",    email: "jasmine.patterson@manufac.com",     contactNumber: "+14155551085",  lastContactAt: "2026-02-27 10:15:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 97,  name: "Parker Hughes",        email: "parker.hughes@industrial.com",      contactNumber: "+14155551086",  lastContactAt: "2026-02-28 13:45:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 98,  name: "Sierra Flores",        email: "sierra.flores@industrial.com",      contactNumber: "+14155551087",  lastContactAt: "2026-01-01 11:30:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 99,  name: "Hayden Washington",    email: "hayden.washington@industrial.com",  contactNumber: "+14155551088",  lastContactAt: "2026-01-02 15:00:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 100, name: "Brooke Butler",        email: "brooke.butler@industrial.com",      contactNumber: "+14155551089",  lastContactAt: "2026-01-03 09:45:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 101, name: "Garrett Simmons",      email: "garrett.simmons@industrial.com",    contactNumber: "+14155551090",  lastContactAt: "2026-01-04 14:15:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 102, name: "Savannah Foster",      email: "savannah.foster@factory.com",       contactNumber: "+14155551091",  lastContactAt: "2026-01-05 10:00:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 103, name: "Wyatt Gonzales",       email: "wyatt.gonzales@factory.com",        contactNumber: "+14155551092",  lastContactAt: "2026-01-06 13:30:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 104, name: "Chloe Bryant",         email: "chloe.bryant@factory.com",          contactNumber: "+14155551093",  lastContactAt: "2026-01-07 16:45:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 105, name: "Mason Alexander",      email: "mason.alexander@factory.com",       contactNumber: "+14155551094",  lastContactAt: "2026-01-08 11:00:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 106, name: "Isabelle Russell",     email: "isabelle.russell@factory.com",      contactNumber: "+14155551095",  lastContactAt: "2026-01-09 14:30:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 107, name: "Logan Griffin",        email: "logan.griffin@production.com",      contactNumber: "+14155551096",  lastContactAt: "2026-01-10 09:15:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 108, name: "Zoe Diaz",             email: "zoe.diaz@production.com",           contactNumber: "+14155551097",  lastContactAt: "2026-01-11 12:45:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 109, name: "Hudson Hayes",         email: "hudson.hayes@production.com",       contactNumber: "+14155551098",  lastContactAt: "2026-01-12 16:15:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 110, name: "Lily Myers",           email: "lily.myers@production.com",         contactNumber: "+14155551099",  lastContactAt: "2026-01-13 10:30:00", company: null, owner: DEMO_OWNER, isDeleted: false },
  { id: 111, name: "Carter Ford",          email: "carter.ford@production.com",        contactNumber: "+14155551100",  lastContactAt: "2026-01-14 14:00:00", company: null, owner: DEMO_OWNER, isDeleted: false },
];

const DEMO_COMPANIES: CrmCompanyType[] = [
  { id: 1, name: "Acme Corporation",   industry: "Technology",    website: "https://www.acme.example",     address: "100 Market Street",   contactNumber: "+14155550100", isDeleted: false },
  { id: 2, name: "Globex Ltd",         industry: "Manufacturing", website: "https://www.globex.example",   address: "42 Industrial Avenue", contactNumber: "+442071230001", isDeleted: false },
  { id: 3, name: "Initech Solutions",  industry: "Software",      website: "https://www.initech.example",  address: "8 Innovation Drive",   contactNumber: "+12125550125",  isDeleted: false },
  { id: 4, name: "Umbrella Health",    industry: "Healthcare",    website: "https://www.umbrella.example", address: "75 Wellness Road",     contactNumber: "+61355501010",  isDeleted: false },
  { id: 5, name: "Stark Industries",   industry: "Engineering",   website: "https://www.stark.example",    address: "200 Arc Reactor Way",  contactNumber: "+13105550177",  isDeleted: false },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AddDealFormValues {
  name: string;
  stageId: string;
  contactId: string;
  ownerId: string;
  priority: string;
  amount: string;
  companyId: string;
  description: string;
}

// ---------------------------------------------------------------------------
// PropertyRow — shared row shell (layout only, no raw interactive elements)
// ---------------------------------------------------------------------------

const PropertyRow: FC<{ label: string; children: ReactNode }> = ({
  label,
  children
}) => (
  <div className="flex w-full items-center gap-4 min-h-[44px]">
    <div className="w-[120px] shrink-0 flex items-center">
      <span className="text-[14px] font-medium text-black whitespace-nowrap">{label}</span>
    </div>
    <div className="flex-1 min-w-0 flex items-center">
      {children}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// AddDealSidePanel
// ---------------------------------------------------------------------------

const AddDealSidePanel: FC = () => {
  const translateText = useTranslator("crmModule", "deals", "addDealSidePanel");
  const { setToastMessage } = useToast();
  const [editingField, setEditingField] = useState<string | null>(null);

  const { isSidePanelOpen, closeSidePanel } = useAppStore(
    useShallow((state) => ({
      isSidePanelOpen: state.isSidePanelOpen,
      closeSidePanel: state.closeSidePanel
    }))
  );

  // ---------- stages, contacts, companies, and owner search from API ----------
  const { data: stages = [] } = useGetDealStages();
  const { data: contactsFromApi = [] } = useGetCrmContacts();
  const { data: companiesFromApi = [] } = useGetCrmCompanies();

  // Demo fallback — remove once real data is available
  const contacts = contactsFromApi.length > 0 ? contactsFromApi : DEMO_CONTACTS;
  const companies = companiesFromApi.length > 0 ? companiesFromApi : DEMO_COMPANIES;

  const [ownerSearchTerm, setOwnerSearchTerm] = useState("");
  const { data: searchedEmployees = [] } = useGetSearchedEmployees(ownerSearchTerm);
  const owners = useMemo<CrmOwnerType[]>(
    () =>
      searchedEmployees.map((e) => ({
        employeeId: e.employeeId,
        firstName: e.firstName,
        lastName: e.lastName || null,
        authPic: e.authPic || null
      })),
    [searchedEmployees]
  );

  const stageOptions = useMemo<DropdownOption[]>(
    () =>
      stages.map((s) => ({
        id: String(s.id),
        value: String(s.id),
        label: (
          <div className="inline-flex items-center gap-2.5">
            <div
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: s.color ?? "#6B7280" }}
            />
            <span className="body2">{s.name}</span>
          </div>
        )
      })),
    [stages]
  );

  // ---------------------------------------------------------------------------------------

  const validationSchema = useMemo(
    () =>
      Yup.object({
        name: Yup.string().trim().required(translateText(["dealNameRequired"])),
        stageId: Yup.string().required(translateText(["stageRequired"])),
        contactId: Yup.string().required(translateText(["contactRequired"])),
        ownerId: Yup.string().required(translateText(["ownerRequired"])),
        amount: Yup.string().test(
          "is-valid-amount",
          translateText(["amountInvalid"]),
          (value) => !value || (/^\d+(\.\d+)?$/.test(value) && Number(value) > 0)
        )
      }),
    [translateText]
  );

  const { mutate: createDeal } = useCreateDeal(
    () => {
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["addDealSuccessTitle"]),
        description: translateText(["addDealSuccessDescription"])
      });
      formik.resetForm();
      setEditingField(null);
      closeSidePanel();
    },
    () => {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["addDealErrorTitle"]),
        description: translateText(["addDealErrorDescription"])
      });
    }
  );

  const formik = useFormik<AddDealFormValues>({
    initialValues: {
      name: "",
      stageId: "",
      contactId: "",
      ownerId: "",
      priority: "",
      amount: "",
      companyId: "",
      description: ""
    },
    validationSchema,
    onSubmit: (values) => {
      createDeal({
        name: values.name.trim(),
        stageId: Number(values.stageId),
        contactId: Number(values.contactId),
        ownerId: Number(values.ownerId),
        ...(values.priority && { priority: values.priority }),
        ...(values.amount && { amount: values.amount }),
        ...(values.companyId && { companyId: Number(values.companyId) }),
        ...(values.description && { description: values.description })
      });
    }
  });

  const handleClose = () => {
    formik.resetForm();
    setEditingField(null);
    closeSidePanel();
  };

  // Set default stage to Lead (INITIAL) once stages are fetched
  useEffect(() => {
    if (stages.length > 0 && !formik.values.stageId) {
      const leadStage = stages.find((s) => s.stageType === CrmDealStageEnum.INITIAL);
      if (leadStage) {
        formik.setFieldValue("stageId", String(leadStage.id));
      }
    }
  }, [stages, formik.values.stageId, formik.setFieldValue]);

  const selectedOwner = useMemo<CrmOwnerType | null>(
    () =>
      !formik.values.ownerId
        ? null
        : (owners.find((u) => String(u.employeeId) === formik.values.ownerId) ?? null),
    [formik.values.ownerId, owners]
  );

  const selectedContact = useMemo<CrmContactType | null>(
    () =>
      !formik.values.contactId
        ? null
        : (contacts.find((c) => String(c.id) === formik.values.contactId) ?? null),
    [formik.values.contactId, contacts]
  );

  const selectedCompany = useMemo<CrmCompanyType | null>(
    () =>
      !formik.values.companyId
        ? null
        : (companies.find((co) => String(co.id) === formik.values.companyId) ?? null),
    [formik.values.companyId, companies]
  );

  return (
    <div className="crm-deal-side-panel">
      <SidePanel
        isOpen={isSidePanelOpen}
        onClose={handleClose}
        header={<span className="pl-2 text-2xl font-bold text-black">{translateText(["title"])}</span>}
        width="xl"
        animation="slide"
        closeOnBackdropClick={!formik.dirty}
        closeAriaLabel={translateText(["closePanelAriaLabel"])}
      footer={
        <div className="flex justify-end px-6 py-3">
          <ButtonV2
            variant="primary"
            size="md"
            onClick={() => formik.handleSubmit()}
            disabled={formik.isSubmitting}
            icon={<PlusIcon fill="black" />}
            iconPosition="end"
          >
            {translateText(["addDealBtn"])}
          </ButtonV2>
        </div>
      }
    >
      <div className="flex flex-col gap-6 h-full">
        {/* ── Top row: Deal name + Stage (parallel) ── */}
        <div className="flex gap-6 items-start">
          <div className="flex-[2_1_0] min-w-0">
            <InputField
              label={translateText(["dealNameLabel"])}
              placeholder={translateText(["dealNamePlaceholder"])}
              required
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              state={formik.touched.name && formik.errors.name ? "error" : "default"}
              errorMessage={formik.touched.name && formik.errors.name ? formik.errors.name : undefined}
              fullWidth
            />
          </div>
          <div className="flex-[1_0_0] min-w-0 pt-[26px]">
            <Dropdown
              options={stageOptions}
              value={formik.values.stageId}
              onChange={(v) => formik.setFieldValue("stageId", v)}
              variant="jsx-content"
              className="rounded-lg"
              width="55%"
              placeholder={translateText(["stageLabel"])}
              errorMessage={
                formik.touched.stageId && formik.errors.stageId
                  ? formik.errors.stageId
                  : undefined
              }
            />
          </div>
        </div>

        {/* ── Bottom row: Description + Property rows ── */}
        <div className="flex gap-6 items-start flex-1">
          <div className="flex-[2_1_0] min-w-0">
            <TextArea
              label={translateText(["descriptionLabel"])}
              placeholder={translateText(["descriptionPlaceholder"])}
              value={formik.values.description}
              onChange={(e) => formik.setFieldValue("description", e.target.value)}
              onBlur={formik.handleBlur}
              className="w-full h-[121px]"
            />
          </div>

          {/* ── Right column: Property rows ── */}
          <div className="flex-[1_0_0] min-w-0 flex flex-col gap-4">

          {/* Property rows — bordered card with click-to-edit */}
          <div className="border border-[#E5E7EB] rounded-lg p-3 flex flex-col gap-2 w-full">

            {/* Value — click to edit */}
            <PropertyRow label={translateText(["valueLabel"])}>
              {editingField === "amount" ? (
                <div
                  className="flex-1 min-w-0"
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null))
                      setEditingField(null);
                  }}
                >
                  <InputField
                    name="amount"
                    value={formik.values.amount}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={translateText(["amountPlaceholder"])}
                    type="number"
                    min="0"
                    step="0.01"
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (["e", "E", "+", "-"].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    variant="sm"
                    fullWidth
                    autoFocus
                    state={formik.touched.amount && formik.errors.amount ? "error" : "default"}
                    errorMessage={formik.touched.amount && formik.errors.amount ? formik.errors.amount : undefined}
                  />
                </div>
              ) : (
                <div className="flex flex-col w-full">
                  <button
                    type="button"
                    className={`text-[14px] text-left w-full pl-1 ${
                      formik.touched.amount && formik.errors.amount
                        ? "text-[#DC2626]"
                        : formik.values.amount ? "text-[#111827]" : "text-[#9CA3AF]"
                    }`}
                    onClick={() => setEditingField("amount")}
                  >
                    {formik.values.amount || translateText(["noneText"])}
                  </button>
                  {formik.touched.amount && formik.errors.amount && (
                    <p className="text-[#DC2626] text-[12px] mt-1">
                      {formik.errors.amount}
                    </p>
                  )}
                </div>
              )}
            </PropertyRow>

            {/* Priority */}
            <PropertyRow label={translateText(["priorityLabel"])}>
              <PriorityDropdown
                value={formik.values.priority}
                onChange={(v) => formik.setFieldValue("priority", v)}
                placeholder={translateText(["noneText"])}
              />
            </PropertyRow>

            {/* Owned by */}
            <PropertyRow label={translateText(["ownedByLabel"])}>
              <div className="flex flex-col w-full">
                <PeoplePopupSearch
                  users={owners}
                  selectedUser={selectedOwner}
                  onSearch={setOwnerSearchTerm}
                  onChange={(user) => {
                    formik.setFieldValue("ownerId", user ? String(user.employeeId) : "");
                  }}
                  placeholder={translateText(["noneText"])}
                  searchPlaceholder={translateText(["ownerSearchPlaceholder"])}
                  ariaInvalid={!!(formik.touched.ownerId && formik.errors.ownerId)}
                  ariaErrorMessage={
                    formik.touched.ownerId && formik.errors.ownerId
                      ? formik.errors.ownerId
                      : undefined
                  }
                />
                {formik.touched.ownerId && formik.errors.ownerId && (
                  <p className="text-[#DC2626] text-[12px] mt-1">
                    {formik.errors.ownerId}
                  </p>
                )}
              </div>
            </PropertyRow>

            {/* Contact name */}
            <PropertyRow label={translateText(["contactNameLabel"])}>
              <div className="flex flex-col w-full">
                <ContactPopupSearch
                  contacts={contacts}
                  selectedContact={selectedContact}
                  onChange={(c) =>
                    formik.setFieldValue("contactId", c ? String(c.id) : "")
                  }
                  placeholder={translateText(["noneText"])}
                  searchPlaceholder="Search contacts"
                  ariaInvalid={!!(formik.touched.contactId && formik.errors.contactId)}
                  ariaErrorMessage={
                    formik.touched.contactId && formik.errors.contactId
                      ? formik.errors.contactId
                      : undefined
                  }
                />
                {formik.touched.contactId && formik.errors.contactId && (
                  <p className="text-[#DC2626] text-[12px] mt-1">
                    {formik.errors.contactId}
                  </p>
                )}
              </div>
            </PropertyRow>

            {/* Company name */}
            <PropertyRow label={translateText(["companyNameLabel"])}>
              <CompanyPopupSearch
                companies={companies}
                selectedCompany={selectedCompany}
                onChange={(co) =>
                  formik.setFieldValue("companyId", co ? String(co.id) : "")
                }
                placeholder={translateText(["noneText"])}
                searchPlaceholder="Search companies"
              />
            </PropertyRow>
          </div>
        </div>
        </div>
      </div>
      </SidePanel>
    </div>
  );
};

export default AddDealSidePanel;
