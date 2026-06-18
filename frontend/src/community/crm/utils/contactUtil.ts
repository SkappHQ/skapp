import { SearchableDropdownItem } from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { CompanyLookup } from "~community/crm/types/CommonTypes";
import { groupItemsByPriority } from "~community/crm/utils/crmUtil";

export const toDropdownItem = (
  company: CompanyLookup
): SearchableDropdownItem => ({
  id: String(company.id),
  content: company.name
});

export const mergeAndPrioritizeCompanyDropdownItems = (
  lookupCompanies: CompanyLookup[] | undefined,
  domainCompanies: CompanyLookup[] | undefined
): SearchableDropdownItem[] => {
  const lookupItems = lookupCompanies?.map(toDropdownItem) ?? [];
  const domainItems = domainCompanies?.map(toDropdownItem) ?? [];

  const lookupIds = new Set(lookupItems.map((item) => item.id));
  const domainCompanyIds = domainCompanies?.map((company) => company.id) ?? [];

  const allItems = [
    ...lookupItems,
    ...domainItems.filter((item) => !lookupIds.has(item.id))
  ];

  const { prioritized, deprioritized } = groupItemsByPriority(
    allItems,
    domainCompanyIds
  );

  return [...prioritized, ...deprioritized];
};
