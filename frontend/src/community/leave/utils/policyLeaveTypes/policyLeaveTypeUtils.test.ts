import { AxiosError } from "axios";

import {
  COMMON_ERROR_ACCESS_DENIED,
  LEAVE_ERROR_POLICY_LEAVE_TYPE_ALREADY_EXISTS
} from "~community/common/constants/errorMessageKeys";
import { LeaveDurationTypes } from "~community/leave/enums/LeaveTypeEnums";
import { PolicyLeaveTypeFormDataType } from "~community/leave/types/PolicyLeaveTypeTypes";

import {
  getMinDurationTranslationKeys,
  getPolicyLeaveTypeErrorToastKeys,
  getUpdatedMinDuration,
  isMinDurationSelected,
  mapPolicyLeaveTypeFormToPayload
} from "./policyLeaveTypeUtils";

const buildError = (messageKey?: string): AxiosError =>
  ({
    response: {
      data: messageKey ? { results: [{ messageKey }] } : {}
    }
  }) as AxiosError;

describe("getUpdatedMinDuration", () => {
  it("selects the clicked duration when nothing is selected", () => {
    expect(
      getUpdatedMinDuration(
        LeaveDurationTypes.NONE,
        LeaveDurationTypes.HALF_DAY
      )
    ).toBe(LeaveDurationTypes.HALF_DAY);
    expect(
      getUpdatedMinDuration(
        LeaveDurationTypes.NONE,
        LeaveDurationTypes.FULL_DAY
      )
    ).toBe(LeaveDurationTypes.FULL_DAY);
  });

  it("deselects the only selected duration", () => {
    expect(
      getUpdatedMinDuration(
        LeaveDurationTypes.HALF_DAY,
        LeaveDurationTypes.HALF_DAY
      )
    ).toBe(LeaveDurationTypes.NONE);
    expect(
      getUpdatedMinDuration(
        LeaveDurationTypes.FULL_DAY,
        LeaveDurationTypes.FULL_DAY
      )
    ).toBe(LeaveDurationTypes.NONE);
  });

  it("combines both durations when the other one is clicked", () => {
    expect(
      getUpdatedMinDuration(
        LeaveDurationTypes.HALF_DAY,
        LeaveDurationTypes.FULL_DAY
      )
    ).toBe(LeaveDurationTypes.HALF_AND_FULL_DAY);
    expect(
      getUpdatedMinDuration(
        LeaveDurationTypes.FULL_DAY,
        LeaveDurationTypes.HALF_DAY
      )
    ).toBe(LeaveDurationTypes.HALF_AND_FULL_DAY);
  });

  it("leaves the unclicked duration selected when both were selected", () => {
    expect(
      getUpdatedMinDuration(
        LeaveDurationTypes.HALF_AND_FULL_DAY,
        LeaveDurationTypes.HALF_DAY
      )
    ).toBe(LeaveDurationTypes.FULL_DAY);
    expect(
      getUpdatedMinDuration(
        LeaveDurationTypes.HALF_AND_FULL_DAY,
        LeaveDurationTypes.FULL_DAY
      )
    ).toBe(LeaveDurationTypes.HALF_DAY);
  });
});

describe("isMinDurationSelected", () => {
  it("treats both durations as selected when combined", () => {
    expect(
      isMinDurationSelected(
        LeaveDurationTypes.HALF_AND_FULL_DAY,
        LeaveDurationTypes.HALF_DAY
      )
    ).toBe(true);
    expect(
      isMinDurationSelected(
        LeaveDurationTypes.HALF_AND_FULL_DAY,
        LeaveDurationTypes.FULL_DAY
      )
    ).toBe(true);
  });

  it("matches only the selected duration", () => {
    expect(
      isMinDurationSelected(
        LeaveDurationTypes.HALF_DAY,
        LeaveDurationTypes.HALF_DAY
      )
    ).toBe(true);
    expect(
      isMinDurationSelected(
        LeaveDurationTypes.HALF_DAY,
        LeaveDurationTypes.FULL_DAY
      )
    ).toBe(false);
  });

  it("returns false when nothing is selected", () => {
    expect(
      isMinDurationSelected(
        LeaveDurationTypes.NONE,
        LeaveDurationTypes.HALF_DAY
      )
    ).toBe(false);
  });
});

describe("getMinDurationTranslationKeys", () => {
  it("returns the translation key for a single duration", () => {
    expect(getMinDurationTranslationKeys(LeaveDurationTypes.HALF_DAY)).toEqual([
      "halfDay"
    ]);
    expect(getMinDurationTranslationKeys(LeaveDurationTypes.FULL_DAY)).toEqual([
      "fullDay"
    ]);
  });

  it("returns both keys when both durations are allowed", () => {
    expect(
      getMinDurationTranslationKeys(LeaveDurationTypes.HALF_AND_FULL_DAY)
    ).toEqual(["fullDay", "halfDay"]);
  });

  it("returns no keys when no duration is selected", () => {
    expect(getMinDurationTranslationKeys(LeaveDurationTypes.NONE)).toEqual([]);
  });
});

describe("mapPolicyLeaveTypeFormToPayload", () => {
  const formData: PolicyLeaveTypeFormDataType = {
    name: "  Annual Leave  ",
    emoji: "🌴",
    emojiCode: "U+1F334",
    colorCode: "#FFC107",
    minDuration: LeaveDurationTypes.HALF_AND_FULL_DAY,
    isAttachment: true,
    isAttachmentMust: true,
    isCommentMust: true,
    isAutoApproval: false
  };

  it("trims the name and drops the form-only emoji field", () => {
    const payload = mapPolicyLeaveTypeFormToPayload(formData);

    expect(payload.name).toBe("Annual Leave");
    expect(payload).not.toHaveProperty("emoji");
  });

  it("forces isAttachmentMust to false when attachments are disabled", () => {
    const payload = mapPolicyLeaveTypeFormToPayload({
      ...formData,
      isAttachment: false,
      isAttachmentMust: true
    });

    expect(payload.isAttachment).toBe(false);
    expect(payload.isAttachmentMust).toBe(false);
  });

  it("keeps isAttachmentMust when attachments are enabled", () => {
    const payload = mapPolicyLeaveTypeFormToPayload(formData);

    expect(payload.isAttachmentMust).toBe(true);
  });
});

describe("getPolicyLeaveTypeErrorToastKeys", () => {
  it("returns duplicate keys for an already-exists error", () => {
    expect(
      getPolicyLeaveTypeErrorToastKeys(
        buildError(LEAVE_ERROR_POLICY_LEAVE_TYPE_ALREADY_EXISTS)
      )
    ).toEqual({
      title: "duplicateToastTitle",
      description: "duplicateToastDescription"
    });
  });

  it("returns permission keys for an access-denied error", () => {
    expect(
      getPolicyLeaveTypeErrorToastKeys(buildError(COMMON_ERROR_ACCESS_DENIED))
    ).toEqual({
      title: "permissionToastTitle",
      description: "permissionToastDescription"
    });
  });

  it("falls back to the generic keys for an unknown message key", () => {
    expect(
      getPolicyLeaveTypeErrorToastKeys(buildError("SOMETHING_ELSE"))
    ).toEqual({
      title: "errorToastTitle",
      description: "errorToastDescription"
    });
  });

  it("falls back to the generic keys for a malformed error object", () => {
    expect(getPolicyLeaveTypeErrorToastKeys({} as AxiosError)).toEqual({
      title: "errorToastTitle",
      description: "errorToastDescription"
    });
  });
});
