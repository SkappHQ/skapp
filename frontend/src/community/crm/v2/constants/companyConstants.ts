import { CrmIndustryEnum } from "~community/crm/v2/enums/common";

export const INDUSTRY_OPTION_KEYS: Record<CrmIndustryEnum, string> = {
  [CrmIndustryEnum.NONE]: "none",
  [CrmIndustryEnum.ACCOMMODATION_SERVICES]: "accommodationServices",
  [CrmIndustryEnum.ADMINISTRATIVE_AND_SUPPORT_SERVICES]:
    "administrativeAndSupportServices",
  [CrmIndustryEnum.CONSTRUCTION]: "construction",
  [CrmIndustryEnum.CONSUMER_SERVICES]: "consumerServices",
  [CrmIndustryEnum.EDUCATION]: "education",
  [CrmIndustryEnum.ENTERTAINMENT_PROVIDERS]: "entertainmentProviders",
  [CrmIndustryEnum.FARMING_RANCHING_FORESTRY]: "farmingRanchingForestry",
  [CrmIndustryEnum.FINANCIAL_SERVICES]: "financialServices",
  [CrmIndustryEnum.GOVERNMENT_ADMINISTRATION]: "governmentAdministration",
  [CrmIndustryEnum.HOLDING_COMPANIES]: "holdingCompanies",
  [CrmIndustryEnum.HOSPITALS_AND_HEALTH_CARE]: "hospitalsAndHealthCare",
  [CrmIndustryEnum.MANUFACTURING]: "manufacturing",
  [CrmIndustryEnum.OIL_GAS_AND_MINING]: "oilGasAndMining",
  [CrmIndustryEnum.PROFESSIONAL_SERVICES]: "professionalServices",
  [CrmIndustryEnum.REAL_ESTATE_AND_EQUIPMENT_RENTAL_SERVICES]:
    "realEstateAndEquipmentRentalServices",
  [CrmIndustryEnum.RETAIL]: "retail",
  [CrmIndustryEnum.TECHNOLOGY_INFORMATION_AND_MEDIA]:
    "technologyInformationAndMedia",
  [CrmIndustryEnum.TRANSPORTATION_LOGISTICS_SUPPLY_CHAIN_AND_STORAGE]:
    "transportationLogisticsSupplyChainAndStorage",
  [CrmIndustryEnum.UTILITIES]: "utilities",
  [CrmIndustryEnum.WHOLESALE]: "wholesale"
};
