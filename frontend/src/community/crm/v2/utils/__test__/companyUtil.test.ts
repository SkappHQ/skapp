import { CrmCompanyEntity } from "~community/crm/v2/types/CrmCommonTypes";

import { getCompanyFieldDiff, removeCompany } from "../companyUtil";

const acme: CrmCompanyEntity = { id: 1, name: "Acme Corp" };
const globex: CrmCompanyEntity = { id: 2, name: "Globex" };

describe("getCompanyFieldDiff", () => {
  it("returns only the fields that changed", () => {
    const result = getCompanyFieldDiff(
      { name: "Acme Corp", website: "https://acme.com" },
      { name: "Acme Renamed", website: "https://acme.com" }
    );

    expect(result).toEqual({ name: "Acme Renamed" });
  });

  it("returns an empty object when nothing changed", () => {
    const result = getCompanyFieldDiff(
      { name: "Acme Corp" },
      { name: "Acme Corp" }
    );

    expect(result).toEqual({});
  });
});

describe("removeCompany", () => {
  it("drops the company from both the record and the id array", () => {
    const result = removeCompany({ 1: acme, 2: globex }, [1, 2], 1);

    expect(result.companyIds).toEqual([2]);
    expect(result.companies[1]).toBeUndefined();
  });
});
