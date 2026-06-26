import { theme } from "~community/common/theme/theme";
import { AccountStatusEnums } from "~community/people/enums/DirectoryEnums";

import { getStatusStyle } from "./terminationUtil";

describe("getStatusStyle", () => {
  it("should return correct style for ACTIVE status", () => {
    const result = getStatusStyle(
      AccountStatusEnums.ACTIVE.toUpperCase() as AccountStatusEnums
    );

    expect(result).toEqual({
      backgroundColor: theme.palette.greens.lighter,
      color: theme.palette.greens.deepShadows
    });
  });

  it("should return correct style for PENDING status", () => {
    const result = getStatusStyle(
      AccountStatusEnums.PENDING.toUpperCase() as AccountStatusEnums
    );

    expect(result).toEqual({
      backgroundColor: theme.palette.amber.mid,
      color: theme.palette.amber.chipText
    });
  });

  it("should return correct style for TERMINATED status", () => {
    const result = getStatusStyle(
      AccountStatusEnums.TERMINATED.toUpperCase() as AccountStatusEnums
    );

    expect(result).toEqual({
      backgroundColor: theme.palette.error.light,
      color: theme.palette.text.darkerText
    });
  });

  it("should return null for invalid status", () => {
    const result = getStatusStyle("INVALID_STATUS" as AccountStatusEnums);

    expect(result).toBeNull();
  });

  it("should be case sensitive", () => {
    const result = getStatusStyle(
      AccountStatusEnums.ACTIVE.toLowerCase() as AccountStatusEnums
    );

    expect(result).toBeNull();
  });
});
