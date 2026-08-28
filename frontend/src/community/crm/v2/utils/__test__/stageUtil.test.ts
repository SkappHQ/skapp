import { CrmStageEntity } from "~community/crm/v2/types/CrmCommonTypes";

import { isStageNameTaken } from "../stageUtil";

const stages: CrmStageEntity[] = [
  { id: 1, name: "DEMO_SCHEDULED" },
  { id: 2, name: "Follow Up" }
];

describe("isStageNameTaken", () => {
  it("matches a seeded stage typed the way the screen shows it", () => {
    expect(isStageNameTaken(stages, "Demo Scheduled")).toBe(true);
  });

  it("matches a seeded stage typed exactly as stored", () => {
    expect(isStageNameTaken(stages, "DEMO_SCHEDULED")).toBe(true);
  });

  it("matches a user created stage regardless of casing", () => {
    expect(isStageNameTaken(stages, "follow up")).toBe(true);
  });

  it("ignores repeated and surrounding whitespace", () => {
    expect(isStageNameTaken(stages, "  Demo   Scheduled  ")).toBe(true);
  });

  it("allows a name nothing else uses", () => {
    expect(isStageNameTaken(stages, "Negotiation")).toBe(false);
  });

  it("allows the stage being edited to keep its own name", () => {
    expect(isStageNameTaken(stages, "Demo Scheduled", 1)).toBe(false);
  });

  it("skips stages without a name", () => {
    expect(isStageNameTaken([{ id: 3 }], "Follow Up")).toBe(false);
  });
});
