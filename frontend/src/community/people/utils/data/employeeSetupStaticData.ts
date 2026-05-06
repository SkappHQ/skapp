import { PermissionTypes } from "~community/common/types/CommonTypes";
import {
  AccountStatusTypes,
  BloodGroupTypes,
  EEOJobCategoryTypes,
  EmploymentAllocationTypes,
  EmploymentTypes,
  GenderEnum,
  MaritalStatusTypes,
  RelationshipTypes,
  TitleEnum
} from "~community/people/enums/PeopleEnums";
import { SystemPermissionTypes } from "~community/people/types/AddNewResourceTypes";

export const PermissionsList = [
  { label: "Employee", value: PermissionTypes.EMPLOYEES },
  { label: "Manager", value: PermissionTypes.MANAGER }
];

export const EmployeeTypesList = [
  { label: "Intern", value: EmploymentTypes.INTERN },
  { label: "Contract", value: EmploymentTypes.CONTRACT },
  { label: "Permanent", value: EmploymentTypes.PERMANENT }
];

export const getTitleList = (translateText: (keys: string[]) => string) => [
  { label: translateText(["titleMr"]), value: TitleEnum.MR },
  { label: translateText(["titleMrs"]), value: TitleEnum.MRS },
  { label: translateText(["titleMiss"]), value: TitleEnum.MISS }
];

export const GenderList = [
  {
    label: "Male",
    value: GenderEnum.MALE
  },
  {
    label: "Female",
    value: GenderEnum.FEMALE
  },
  {
    label: "Other",
    value: GenderEnum.OTHER
  }
];

export const MaritalStatusList = [
  { label: "Single", value: MaritalStatusTypes.SINGLE },
  { label: "Married", value: MaritalStatusTypes.MARRIED },
  { label: "Separated", value: MaritalStatusTypes.SEPARATED },
  { label: "Widowed", value: MaritalStatusTypes.WIDOWED }
];

export const RelationshipList = [
  { label: "Spouse", value: RelationshipTypes.SPOUSE },
  { label: "Child", value: RelationshipTypes.CHILD }
];

export const EmergencyContactRelationshipList = [
  { label: "Family", value: RelationshipTypes.FAMILY },
  { label: "Friend", value: RelationshipTypes.FRIEND },
  { label: "Guardian", value: RelationshipTypes.GUARDIAN }
];

export const EmployementStatusList = [
  { label: "Pending", value: AccountStatusTypes.PENDING },
  { label: "Active", value: AccountStatusTypes.ACTIVE },
  { label: "Terminated", value: AccountStatusTypes.TERMINATED }
];

export const EmployementAllocationList = [
  { label: "Full Time", value: EmploymentAllocationTypes.FULL_TIME },
  { label: "Part Time", value: EmploymentAllocationTypes.PART_TIME }
];

export const SystemPermissionList = [
  { label: "Employee", value: SystemPermissionTypes.EMPLOYEES },
  { label: "Manager", value: SystemPermissionTypes.MANAGERS },
  { label: "Super Admin", value: SystemPermissionTypes.SUPER_ADMIN }
];

export const BloodGroupList = [
  { label: "A+", value: BloodGroupTypes.A_POSITIVE },
  { label: "A-", value: BloodGroupTypes.A_NEGATIVE },
  { label: "B+", value: BloodGroupTypes.B_POSITIVE },
  { label: "B-", value: BloodGroupTypes.B_NEGATIVE },
  { label: "AB+", value: BloodGroupTypes.AB_POSITIVE },
  { label: "AB-", value: BloodGroupTypes.AB_NEGATIVE },
  { label: "O+", value: BloodGroupTypes.O_POSITIVE },
  { label: "O-", value: BloodGroupTypes.O_NEGATIVE }
];

export const EEOJobCategoryList = [
  {
    label: "Executive/Senior Level Officials and Managers",
    value: EEOJobCategoryTypes.EXECUTIVE
  },
  {
    label: "First/Mid-Level Officials and Managers",
    value: EEOJobCategoryTypes.FIRST_MID_LEVEL
  },
  {
    label: "Professionals",
    value: EEOJobCategoryTypes.PROFESSIONALS
  },
  {
    label: "Technicians",
    value: EEOJobCategoryTypes.TECHNICIANS
  },
  {
    label: "Sales Workers",
    value: EEOJobCategoryTypes.SALES_WORKERS
  },
  {
    label: "Administrative Support Workers",
    value: EEOJobCategoryTypes.SUPPORT_WORKERS
  },
  {
    label: "Craft Workers",
    value: EEOJobCategoryTypes.CRAFT_WORKERS
  },
  {
    label: "Operatives",
    value: EEOJobCategoryTypes.OPERATIVES
  },
  {
    label: "Laborers and Helpers",
    value: EEOJobCategoryTypes.LABORERS
  },
  {
    label: "Service Workers",
    value: EEOJobCategoryTypes.SERVICE_WORKERS
  }
];

export const EthnicityList = [
  {
    value: "AFRICAN",
    label: "African"
  },
  {
    value: "CARIBBEAN",
    label: "Caribbean"
  },
  {
    value: "INDIAN",
    label: "Indian"
  },
  {
    value: "MELANESIAN",
    label: "Melanesian"
  },
  {
    value: "AUSTRALASIAN_OR_ABORIGINAL",
    label: "Australasian/Aboriginal"
  },
  {
    value: "CHINESE",
    label: "Chinese"
  },
  {
    value: "GUAMANIAN",
    label: "Guamanian"
  },
  {
    value: "JAPANESE",
    label: "Japanese"
  },
  {
    value: "KOREAN",
    label: "Korean"
  },
  {
    value: "POLYNESIAN",
    label: "Polynesian"
  },
  {
    value: "EUROPEAN_OR_ANGLO_SAXON",
    label: "European/Anglo Saxon"
  },
  {
    value: "OTHER_PACIFIC_ISLANDER",
    label: "Other Pacific Islander"
  },
  {
    value: "LATIN_AMERICAN",
    label: "Latin American"
  },
  {
    value: "ARABIC",
    label: "Arabic"
  },
  {
    value: "VIETNAMESE",
    label: "Vietnamese"
  },
  {
    value: "MICRONESIAN",
    label: "Micronesian"
  },
  {
    value: "DECLINED_TO_RESPOND",
    label: "Declined to Respond"
  },
  {
    value: "OTHER_HISPANIC",
    label: "Other Hispanic"
  },
  {
    value: "US_OR_CANADIAN_INDIAN",
    label: "US or Canadian Indian"
  },
  {
    value: "OTHER_ASIAN",
    label: "Other Asian"
  },
  {
    value: "PUERTO_RICAN",
    label: "Puerto Rican"
  },
  {
    value: "FILIPINO",
    label: "Filipino"
  },
  {
    value: "MEXICAN",
    label: "Mexican"
  },
  {
    value: "ALASKAN_NATIVE",
    label: "Alaskan Native"
  },
  {
    value: "CUBAN",
    label: "Cuban"
  }
];

export const NationalityList = [
  { label: "Afghan", value: "Afghan" },
  { label: "Ålandish", value: "Ålandish" },
  { label: "Albanian", value: "Albanian" },
  { label: "Algerian", value: "Algerian" },
  { label: "American", value: "American" },
  { label: "American Islander", value: "American Islander" },
  { label: "American Samoan", value: "American Samoan" },
  { label: "Andorran", value: "Andorran" },
  { label: "Angolan", value: "Angolan" },
  { label: "Anguillian", value: "Anguillian" },
  { label: "Antarctican", value: "Antarctican" },
  { label: "Antiguan, Barbudan", value: "Antiguan, Barbudan" },
  { label: "Argentine", value: "Argentine" },
  { label: "Armenian", value: "Armenian" },
  { label: "Aruban", value: "Aruban" },
  { label: "Australian", value: "Australian" },
  { label: "Austrian", value: "Austrian" },
  { label: "Azerbaijani", value: "Azerbaijani" },
  { label: "Bahamian", value: "Bahamian" },
  { label: "Bahraini", value: "Bahraini" },
  { label: "Bangladeshi", value: "Bangladeshi" },
  { label: "Barbadian", value: "Barbadian" },
  { label: "Belarusian", value: "Belarusian" },
  { label: "Belgian", value: "Belgian" },
  { label: "Belizean", value: "Belizean" },
  { label: "Beninese", value: "Beninese" },
  { label: "Bermudian", value: "Bermudian" },
  { label: "Bhutanese", value: "Bhutanese" },
  { label: "Bolivian", value: "Bolivian" },
  { label: "Bosnian, Herzegovinian", value: "Bosnian, Herzegovinian" },
  { label: "Brazilian", value: "Brazilian" },
  { label: "British", value: "British" },
  { label: "Bruneian", value: "Bruneian" },
  { label: "Bulgarian", value: "Bulgarian" },
  { label: "Burkinabe", value: "Burkinabe" },
  { label: "Burmese", value: "Burmese" },
  { label: "Burundian", value: "Burundian" },
  { label: "Cambodian", value: "Cambodian" },
  { label: "Cameroonian", value: "Cameroonian" },
  { label: "Canadian", value: "Canadian" },
  { label: "Cape Verdian", value: "Cape Verdian" },
  { label: "Caymanian", value: "Caymanian" },
  { label: "Central African", value: "Central African" },
  { label: "Chadian", value: "Chadian" },
  { label: "Channel Islander", value: "Channel Islander" },
  { label: "Chilean", value: "Chilean" },
  { label: "Chinese", value: "Chinese" },
  { label: "Christmas Islander", value: "Christmas Islander" },
  { label: "Cocos Islander", value: "Cocos Islander" },
  { label: "Colombian", value: "Colombian" },
  { label: "Comoran", value: "Comoran" },
  { label: "Congolese", value: "Congolese" },
  { label: "Cook Islander", value: "Cook Islander" },
  { label: "Costa Rican", value: "Costa Rican" },
  { label: "Croatian", value: "Croatian" },
  { label: "Cuban", value: "Cuban" },
  { label: "Curaçaoan", value: "Curaçaoan" },
  { label: "Cypriot", value: "Cypriot" },
  { label: "Czech", value: "Czech" },
  { label: "Danish", value: "Danish" },
  { label: "Djibouti", value: "Djibouti" },
  { label: "Dominican", value: "Dominican" },
  { label: "Dutch", value: "Dutch" },
  { label: "East Timorese", value: "East Timorese" },
  { label: "Ecuadorean", value: "Ecuadorean" },
  { label: "Egyptian", value: "Egyptian" },
  { label: "Emirati", value: "Emirati" },
  { label: "Equatorial Guinean", value: "Equatorial Guinean" },
  { label: "Eritrean", value: "Eritrean" },
  { label: "Estonian", value: "Estonian" },
  { label: "Ethiopian", value: "Ethiopian" },
  { label: "Falkland Islander", value: "Falkland Islander" },
  { label: "Faroese", value: "Faroese" },
  { label: "Fijian", value: "Fijian" },
  { label: "Filipino", value: "Filipino" },
  { label: "Finnish", value: "Finnish" },
  { label: "French", value: "French" },
  { label: "French Polynesian", value: "French Polynesian" },
  { label: "Gabonese", value: "Gabonese" },
  { label: "Gambian", value: "Gambian" },
  { label: "Georgian", value: "Georgian" },
  { label: "German", value: "German" },
  { label: "Ghanaian", value: "Ghanaian" },
  { label: "Gibraltar", value: "Gibraltar" },
  { label: "Greek", value: "Greek" },
  { label: "Greenlandic", value: "Greenlandic" },
  { label: "Grenadian", value: "Grenadian" },
  { label: "Guadeloupian", value: "Guadeloupian" },
  { label: "Guamanian", value: "Guamanian" },
  { label: "Guatemalan", value: "Guatemalan" },
  { label: "Guianan", value: "Guianan" },
  { label: "Guinea-Bissauan", value: "Guinea-Bissauan" },
  { label: "Guinean", value: "Guinean" },
  { label: "Guyanese", value: "Guyanese" },
  { label: "Haitian", value: "Haitian" },
  { label: "Honduran", value: "Honduran" },
  { label: "Hong Konger", value: "Hong Konger" },
  { label: "Hungarian", value: "Hungarian" },
  { label: "I-Kiribati", value: "I-Kiribati" },
  { label: "Icelander", value: "Icelander" },
  { label: "Indian", value: "Indian" },
  { label: "Indonesian", value: "Indonesian" },
  { label: "Iranian", value: "Iranian" },
  { label: "Iraqi", value: "Iraqi" },
  { label: "Irish", value: "Irish" },
  { label: "Israeli", value: "Israeli" },
  { label: "Italian", value: "Italian" },
  { label: "Ivorian", value: "Ivorian" },
  { label: "Jamaican", value: "Jamaican" },
  { label: "Japanese", value: "Japanese" },
  { label: "Jordanian", value: "Jordanian" },
  { label: "Kazakhstani", value: "Kazakhstani" },
  { label: "Kenyan", value: "Kenyan" },
  { label: "Kirghiz", value: "Kirghiz" },
  { label: "Kittitian or Nevisian", value: "Kittitian or Nevisian" },
  { label: "Kosovar", value: "Kosovar" },
  { label: "Kuwaiti", value: "Kuwaiti" },
  { label: "Laotian", value: "Laotian" },
  { label: "Latvian", value: "Latvian" },
  { label: "Lebanese", value: "Lebanese" },
  { label: "Liberian", value: "Liberian" },
  { label: "Libyan", value: "Libyan" },
  { label: "Liechtensteiner", value: "Liechtensteiner" },
  { label: "Lithuanian", value: "Lithuanian" },
  { label: "Luxembourger", value: "Luxembourger" },
  { label: "Macanese", value: "Macanese" },
  { label: "Macedonian", value: "Macedonian" },
  { label: "Mahoran", value: "Mahoran" },
  { label: "Malagasy", value: "Malagasy" },
  { label: "Malawian", value: "Malawian" },
  { label: "Malaysian", value: "Malaysian" },
  { label: "Maldivan", value: "Maldivan" },
  { label: "Malian", value: "Malian" },
  { label: "Maltese", value: "Maltese" },
  { label: "Manx", value: "Manx" },
  { label: "Marshallese", value: "Marshallese" },
  { label: "Martinican", value: "Martinican" },
  { label: "Mauritanian", value: "Mauritanian" },
  { label: "Mauritian", value: "Mauritian" },
  { label: "Mexican", value: "Mexican" },
  { label: "Micronesian", value: "Micronesian" },
  { label: "Moldovan", value: "Moldovan" },
  { label: "Monegasque", value: "Monegasque" },
  { label: "Mongolian", value: "Mongolian" },
  { label: "Montenegrin", value: "Montenegrin" },
  { label: "Montserratian", value: "Montserratian" },
  { label: "Moroccan", value: "Moroccan" },
  { label: "Mosotho", value: "Mosotho" },
  { label: "Motswana", value: "Motswana" },
  { label: "Mozambican", value: "Mozambican" },
  { label: "Namibian", value: "Namibian" },
  { label: "Nauruan", value: "Nauruan" },
  { label: "Nepalese", value: "Nepalese" },
  { label: "New Caledonian", value: "New Caledonian" },
  { label: "New Zealander", value: "New Zealander" },
  { label: "Ni-Vanuatu", value: "Ni-Vanuatu" },
  { label: "Nicaraguan", value: "Nicaraguan" },
  { label: "Nigerian", value: "Nigerian" },
  { label: "Nigerien", value: "Nigerien" },
  { label: "Niuean", value: "Niuean" },
  { label: "Norfolk Islander", value: "Norfolk Islander" },
  { label: "North Korean", value: "North Korean" },
  { label: "Norwegian", value: "Norwegian" },
  { label: "Omani", value: "Omani" },
  { label: "Pakistani", value: "Pakistani" },
  { label: "Palauan", value: "Palauan" },
  { label: "Palestinian", value: "Palestinian" },
  { label: "Panamanian", value: "Panamanian" },
  { label: "Papua New Guinean", value: "Papua New Guinean" },
  { label: "Paraguayan", value: "Paraguayan" },
  { label: "Peruvian", value: "Peruvian" },
  { label: "Pitcairn Islander", value: "Pitcairn Islander" },
  { label: "Polish", value: "Polish" },
  { label: "Portuguese", value: "Portuguese" },
  { label: "Puerto Rican", value: "Puerto Rican" },
  { label: "Qatari", value: "Qatari" },
  { label: "Réunionese", value: "Réunionese" },
  { label: "Romanian", value: "Romanian" },
  { label: "Russian", value: "Russian" },
  { label: "Rwandan", value: "Rwandan" },
  { label: "Sahrawi", value: "Sahrawi" },
  { label: "Saint Barthélemy Islander", value: "Saint Barthélemy Islander" },
  { label: "Saint Helenian", value: "Saint Helenian" },
  { label: "Saint Lucian", value: "Saint Lucian" },
  { label: "Saint Martin Islander", value: "Saint Martin Islander" },
  { label: "Saint Vincentian", value: "Saint Vincentian" },
  {
    label: "Saint-Pierrais, Miquelonnais",
    value: "Saint-Pierrais, Miquelonnais"
  },
  { label: "Salvadoran", value: "Salvadoran" },
  { label: "Sammarinese", value: "Sammarinese" },
  { label: "Samoan", value: "Samoan" },
  { label: "Sao Tomean", value: "Sao Tomean" },
  { label: "Saudi Arabian", value: "Saudi Arabian" },
  { label: "Senegalese", value: "Senegalese" },
  { label: "Serbian", value: "Serbian" },
  { label: "Seychellois", value: "Seychellois" },
  { label: "Sierra Leonean", value: "Sierra Leonean" },
  { label: "Singaporean", value: "Singaporean" },
  { label: "Slovak", value: "Slovak" },
  { label: "Slovene", value: "Slovene" },
  { label: "Solomon Islander", value: "Solomon Islander" },
  { label: "Somali", value: "Somali" },
  { label: "South African", value: "South African" },
  {
    label: "South Georgian South Sandwich Islander",
    value: "South Georgian South Sandwich Islander"
  },
  { label: "South Korean", value: "South Korean" },
  { label: "South Sudanese", value: "South Sudanese" },
  { label: "Spanish", value: "Spanish" },
  { label: "Sri Lankan", value: "Sri Lankan" },
  { label: "St. Maartener", value: "St. Maartener" },
  { label: "Sudanese", value: "Sudanese" },
  { label: "Surinamer", value: "Surinamer" },
  { label: "Swazi", value: "Swazi" },
  { label: "Swedish", value: "Swedish" },
  { label: "Swiss", value: "Swiss" },
  { label: "Syrian", value: "Syrian" },
  { label: "Tadzhik", value: "Tadzhik" },
  { label: "Taiwanese", value: "Taiwanese" },
  { label: "Tanzanian", value: "Tanzanian" },
  { label: "Thai", value: "Thai" },
  { label: "Togolese", value: "Togolese" },
  { label: "Tokelauan", value: "Tokelauan" },
  { label: "Tongan", value: "Tongan" },
  { label: "Trinidadian", value: "Trinidadian" },
  { label: "Tunisian", value: "Tunisian" },
  { label: "Turkish", value: "Turkish" },
  { label: "Turkmen", value: "Turkmen" },
  { label: "Turks and Caicos Islander", value: "Turks and Caicos Islander" },
  { label: "Tuvaluan", value: "Tuvaluan" },
  { label: "Ugandan", value: "Ugandan" },
  { label: "Ukrainian", value: "Ukrainian" },
  { label: "Uruguayan", value: "Uruguayan" },
  { label: "Uzbekistani", value: "Uzbekistani" },
  { label: "Vatican", value: "Vatican" },
  { label: "Venezuelan", value: "Venezuelan" },
  { label: "Vietnamese", value: "Vietnamese" },
  { label: "Virgin Islander", value: "Virgin Islander" },
  { label: "Wallis and Futuna Islander", value: "Wallis and Futuna Islander" },
  { label: "Yemeni", value: "Yemeni" },
  { label: "Zambian", value: "Zambian" },
  { label: "Zimbabwean", value: "Zimbabwean" }
];
