import { characterLengths } from "~community/common/constants/stringConstants";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import {
  ADD_NEW_INDUSTRY_OPTION_ID,
  INDUSTRY_OPTION_KEYS
} from "~community/crm/constants/companyConstants";
import {
  CrmIndustryEnum,
  CrmMetricLabelThemeEnum
} from "~community/crm/enums/common";
import {
  CrmCompanyEntity,
  CrmCompanyRecord,
  CrmIndustryEntity,
  CrmIndustryRecord
} from "~community/crm/types/CrmCommonTypes";
import { CrmIndustryOption } from "~community/crm/types/CrmTypes";

export const toCompanyIds = (companies: CrmCompanyEntity[]): number[] => {
  const companyIds: number[] = [];
  for (const company of companies) {
    if (company.id !== undefined) {
      companyIds.push(company.id);
    }
  }
  return companyIds;
};

export interface CrmMetricChip {
  label: string;
  variant: CrmMetricLabelThemeEnum;
}

export interface CrmMetricItem {
  id: string;
  title: string;
  amount?: string | number;
  isCurrency?: boolean;
  chip?: CrmMetricChip;
}

export const getCompanyMetricItems = (
  company: CrmCompanyEntity,
  translateText: TranslatorFunctionType
): CrmMetricItem[] => [
  {
    id: "accountValue",
    title: translateText(["companies", "sidePanel", "metrics", "accountValue"]),
    amount: company.metrics?.accountValue,
    isCurrency: true
  },
  {
    id: "openDeals",
    title: translateText(["companies", "sidePanel", "metrics", "openDeals"]),
    amount: company.metrics?.openDealsCount ?? 0
  },
  {
    id: "closedDeals",
    title: translateText(["companies", "sidePanel", "metrics", "closedDeals"]),
    amount: company.metrics?.closedDealsCount ?? 0
  }
];

export const getCompanyById = (
  companies: CrmCompanyRecord,
  companyId: number
): CrmCompanyEntity | undefined => companies[companyId];

export const getSelectedCompany = (
  companies: CrmCompanyRecord,
  companyId: number | null
) => {
  if (companyId !== null) {
    return companies[companyId];
  }
};

export const updateCompany = (
  companies: CrmCompanyRecord,
  companyId: number,
  updatedFields: CrmCompanyEntity
): CrmCompanyRecord => ({
  ...companies,
  [companyId]: { ...companies[companyId], ...updatedFields }
});

export const removeCompany = (
  companies: CrmCompanyRecord,
  companyIds: number[],
  companyId: number
) => {
  const remainingCompanies = { ...companies };
  delete remainingCompanies[companyId];

  return {
    companies: remainingCompanies,
    companyIds: companyIds.filter((id) => id !== companyId)
  };
};

export const getChangedCompanyFields = (
  initialValues: CrmCompanyEntity,
  currentValues: CrmCompanyEntity
): CrmCompanyEntity => {
  const changedFields: CrmCompanyEntity = {};

  if (currentValues.name !== initialValues.name) {
    changedFields.name = currentValues.name;
  }

  if (currentValues.industryId !== initialValues.industryId) {
    changedFields.industryId = currentValues.industryId;
  }

  if (currentValues.industryName !== initialValues.industryName) {
    changedFields.industryName = currentValues.industryName;
  }

  if (currentValues.website !== initialValues.website) {
    changedFields.website = currentValues.website;
  }

  if (currentValues.address !== initialValues.address) {
    changedFields.address = currentValues.address;
  }

  if (currentValues.contactNumber !== initialValues.contactNumber) {
    changedFields.contactNumber = currentValues.contactNumber;
  }

  return changedFields;
};

export const getMissingCompanyIds = (
  companyIds: number[],
  companies: CrmCompanyRecord
): number[] => {
  const unique = new Set<number>();
  for (const id of companyIds) {
    if (!companies[id]) unique.add(id);
  }
  return Array.from(unique);
};

const isCrmIndustryEnum = (value: string): value is CrmIndustryEnum =>
  Object.values<string>(CrmIndustryEnum).includes(value);

export const getIndustryDisplayName = (
  industryName: string,
  translateText: TranslatorFunctionType
): string =>
  isCrmIndustryEnum(industryName)
    ? translateText([INDUSTRY_OPTION_KEYS[industryName]])
    : industryName;

const normalizeIndustryName = (name: string): string =>
  name.trim().replace(/\s+/g, " ").toLowerCase();

export const getIndustryOptions = (
  lookupIndustries: CrmIndustryEntity[] | undefined,
  getIndustryByName: (name: string) => string,
  newIndustryName?: string
): CrmIndustryOption[] => {
  const options: CrmIndustryOption[] = [];

  for (const industry of lookupIndustries ?? []) {
    options.push({
      id: String(industry.id),
      name: getIndustryByName(industry.name)
    });
  }

  if (newIndustryName) {
    const trimmedName = newIndustryName.trim();
    const normalizedName = normalizeIndustryName(trimmedName);
    const isNameAvailable = !(lookupIndustries ?? []).some(
      (industry) =>
        normalizeIndustryName(industry.name) === normalizedName ||
        normalizeIndustryName(getIndustryByName(industry.name)) ===
          normalizedName
    );

    if (
      trimmedName.length > 0 &&
      trimmedName.length <= characterLengths.INDUSTRY_NAME_LENGTH &&
      isNameAvailable
    ) {
      options.push({ id: ADD_NEW_INDUSTRY_OPTION_ID, name: trimmedName });
    }
  }

  return options;
};

export const updateIndustryRecord = (
  existing: CrmIndustryRecord,
  incoming: CrmIndustryEntity[]
): CrmIndustryRecord => {
  const merged: CrmIndustryRecord = { ...existing };
  for (const industry of incoming) {
    merged[industry.id] = { ...merged[industry.id], ...industry };
  }
  return merged;
};

export const addNewIndustryToRecord = (
  industries: CrmIndustryRecord,
  industry: CrmIndustryEntity
): CrmIndustryRecord =>
  industries[industry.id]
    ? industries
    : updateIndustryRecord(industries, [industry]);

export const updateCompanyRecord = (
  existing: CrmCompanyRecord,
  incoming: CrmCompanyEntity[]
): CrmCompanyRecord => {
  const merged: CrmCompanyRecord = { ...existing };
  for (const company of incoming) {
    if (company.id === undefined) continue;
    merged[company.id] = { ...merged[company.id], ...company };
  }
  return merged;
};
