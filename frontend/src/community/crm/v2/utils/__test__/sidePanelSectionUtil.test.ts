import { CrmDealStageEnum } from "~community/crm/v2/enums/common";
import { CrmStageRecord } from "~community/crm/v2/types/CrmCommonTypes";

import { getInitialStageId } from "../dealUtil";

const stages: CrmStageRecord = {
  1: { id: 1, name: "LEAD", stageType: CrmDealStageEnum.INITIAL },
  2: { id: 2, name: "NEGOTIATION", stageType: CrmDealStageEnum.OPEN }
};

describe("getInitialStageId", () => {
  it("returns the id of the INITIAL stage", () => {
    expect(getInitialStageId(stages)).toBe(1);
  });

  it("returns undefined before the stages have loaded", () => {
    expect(getInitialStageId({})).toBeUndefined();
  });
});
