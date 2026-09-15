import { characterLengths } from "~community/common/constants/stringConstants";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { ADD_NEW_INDUSTRY_OPTION_ID } from "~community/crm/v2/constants/commonConstants";
import {
  CrmIndustryEnum,
  CrmMetricLabelThemeEnum
} from "~community/crm/v2/enums/common";
import {
  CrmCompanyEntity,
  CrmCompanyRecord,
  CrmIndustryEntity,
  CrmIndustryRecord
} from "~community/crm/v2/types/CrmCommonTypes";

export const normalizeCompanies = (items: CrmCompanyEntity[]) => {
  const companies: CrmCompanyRecord = {};
  const companyIds: number[] = [];

  items.forEach((company) => {
    if (company.id !== undefined) {
      companies[company.id] = company;
      companyIds.push(company.id);
    }
  });

  return { companies, companyIds };
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
    title: translateText(["sidePanel", "metrics", "accountValue"]),
    amount: company.metrics?.accountValue,
    isCurrency: true
  },
  {
    id: "openDeals",
    title: translateText(["sidePanel", "metrics", "openDeals"]),
    amount: company.metrics?.openDealsCount ?? 0
  },
  {
    id: "closedDeals",
    title: translateText(["sidePanel", "metrics", "closedDeals"]),
    amount: company.metrics?.closedDealsCount ?? 0
  }
];

export const getSelectedCompany = (
  companies: CrmCompanyRecord,
  companyId: number | null
) => {
  if (companyId === null) return undefined;

  return companies[companyId];
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

export const getCompanyFormInitialValues = (
  company?: CrmCompanyEntity
): CrmCompanyEntity => ({
  name: company?.name ?? "",
  industryId: company?.industryId ?? null,
  industryName: company?.industryName,
  website: company?.website ?? "",
  address: company?.address ?? "",
  contactNumber: company?.contactNumber ?? ""
});

export const getTrimmedCompanyValues = (
  values: CrmCompanyEntity
): CrmCompanyEntity => ({
  name: values.name?.trim(),
  industryId: values.industryId,
  industryName: values.industryName?.trim(),
  website: values.website?.trim(),
  address: values.address?.trim(),
  contactNumber: values.contactNumber?.trim()
});

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

export const toCompaniesRecord = (
  companies: CrmCompanyEntity[]
): CrmCompanyRecord => {
  const companyRecord: CrmCompanyRecord = {};
  for (const company of companies) {
    if (company.id != null) {
      companyRecord[company.id] = company;
    }
  }
  return companyRecord;
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

export const mergeCompanies = (
  existing: CrmCompanyRecord,
  incoming: CrmCompanyEntity[]
): CrmCompanyRecord => {
  const merged: CrmCompanyRecord = { ...existing };
  for (const company of incoming) {
    if (company.id == null) continue;
    merged[company.id] = { ...merged[company.id], ...company };
  }
  return merged;
};

export const getIndustryDisplayName = (
  industry: CrmIndustryEntity,
  translateText: TranslatorFunctionType
): string =>
  Object.values<string>(CrmIndustryEnum).includes(industry.name)
    ? translateText(["industryOptions", industry.name])
    : industry.name;

export interface CrmIndustryOption {
  id: string;
  name: string;
}

export const getIndustryOptions = (
  industries: CrmIndustryRecord,
  translateText: TranslatorFunctionType,
  searchKeyword: string,
  canAddNewIndustry: boolean
): CrmIndustryOption[] => {
  const trimmedName = searchKeyword.trim();
  const normalizedName = trimmedName.toLowerCase();

  const options: CrmIndustryOption[] = Object.values(industries)
    .map((industry) => ({
      id: String(industry.id),
      name: getIndustryDisplayName(industry, translateText)
    }))
    .filter((option) => option.name.toLowerCase().includes(normalizedName));

  const isNameAvailable = !options.some(
    (option) => option.name.toLowerCase() === normalizedName
  );

  if (
    canAddNewIndustry &&
    trimmedName.length > 0 &&
    trimmedName.length <= characterLengths.INDUSTRY_NAME_LENGTH &&
    isNameAvailable
  ) {
    options.push({ id: ADD_NEW_INDUSTRY_OPTION_ID, name: trimmedName });
  }

  return options;
};

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
