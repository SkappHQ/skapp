import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import {
  CrmIndustryEnum,
  CrmMetricLabelThemeEnum
} from "~community/crm/v2/enums/common";
import {
  CrmCompanyEntity,
  CrmCompanyRecord
} from "~community/crm/v2/types/CrmCommonTypes";

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
    title: translateText(["metrics", "accountValue"]),
    amount: company.metrics?.accountValue,
    isCurrency: true
  },
  {
    id: "openDeals",
    title: translateText(["metrics", "openDeals"]),
    amount: company.metrics?.openDealsCount ?? 0
  },
  {
    id: "closedDeals",
    title: translateText(["metrics", "closedDeals"]),
    amount: company.metrics?.closedDealsCount ?? 0
  }
];

export const getCompanyById = (
  companies: CrmCompanyRecord,
  companyId?: number | null
): CrmCompanyEntity | undefined => {
  if (companyId != null) {
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

export const getCompanyFormInitialValues = (
  company?: CrmCompanyEntity
): CrmCompanyEntity => ({
  name: company?.name ?? "",
  industry: company?.industry ?? CrmIndustryEnum.NONE,
  website: company?.website ?? "",
  address: company?.address ?? "",
  contactNumber: company?.contactNumber ?? ""
});

export const getTrimmedCompanyValues = (
  values: CrmCompanyEntity
): CrmCompanyEntity => ({
  name: values.name?.trim(),
  industry: values.industry,
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

  if (currentValues.industry !== initialValues.industry) {
    changedFields.industry = currentValues.industry;
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
