import { SxProps, Theme } from "@mui/material";
import { NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

import { HOURS_PER_DAY } from "~community/common/constants/timeConstants";
import {
  alphaNumericNamePatternWithSpecialCharacters,
  containsUnicode,
  matchInvalidEmailCharactersSearchPattern,
  removeNonAlphaNumericCharactersPattern
} from "~community/common/regex/regexPatterns";
import {
  DropdownListType,
  FileUploadType
} from "~community/common/types/CommonTypes";
import {
  DefaultDayCapacityType,
  WorkingDaysTypes
} from "~community/configurations/types/TimeConfigurationsTypes";
import { JobFamilies } from "~community/people/types/JobRolesTypes";
import { getShortDayName } from "~community/people/utils/holidayUtils/commonUtils";

import ROUTES from "../constants/routes";

export const getLabelByValue = (
  objectArray: DropdownListType[],
  value: number | string
): string | undefined => {
  const labelValue = objectArray.find(
    (object: DropdownListType) => object.value === value
  );
  return labelValue ? labelValue.label.toString() : undefined;
};

export const hasSpecificRole = (roles: string[], role: string): boolean => {
  return roles.includes(role);
};

export const getEmoji = (unicode: string): string => {
  try {
    if (unicode.startsWith("&#")) {
      const codePoint = parseInt(unicode.slice(2, -1), 10);
      return String.fromCodePoint(codePoint);
    }

    const codePoints = unicode.split("-").map((part) => parseInt(part, 16));
    return String.fromCodePoint(...codePoints);
  } catch {
    return "";
  }
};

export const hasUnicodeCharacters = (checkedValue: string) => {
  const unicodeRegex = containsUnicode();

  if (!checkedValue.length) return false;
  if (checkedValue.charCodeAt(0) > 255) return true;
  return unicodeRegex.test(checkedValue);
};

export const removeDuplicates = (
  uploadableFiles: FileUploadType[],
  acceptedFiles: File[],
  maxFileSize: number
) => {
  if (maxFileSize !== 1) {
    uploadableFiles.forEach((file) => {
      acceptedFiles = acceptedFiles.filter(
        (acFile) => acFile.name !== file.name
      );
    });
  }

  return acceptedFiles;
};

export const mergeSx = (
  sxProps: Array<SxProps<Theme> | undefined>
): SxProps<Theme> => {
  return sxProps
    .filter((sx): sx is SxProps<Theme> => sx !== undefined)
    .reduce<SxProps<Theme>>((prev, currentValue) => {
      return [
        ...(Array.isArray(prev) ? prev : [prev]),
        ...(Array.isArray(currentValue) ? currentValue : [currentValue])
      ];
    }, [] as SxProps<Theme>);
};

export const removeSpecialCharacters = (
  string: string,
  replaceTerm: string = ""
): string =>
  string?.replace(removeNonAlphaNumericCharactersPattern(), replaceTerm);

export const removeInvalidEmailSearchCharacters = (
  string: string,
  replaceTerm: string = ""
): string => {
  return (
    string?.replace(matchInvalidEmailCharactersSearchPattern(), replaceTerm) ||
    ""
  );
};

export const pascalCaseFormatter = (wordString: string | null | undefined) => {
  if (!wordString) {
    return "";
  }

  const normalizedString = wordString.trim().replace(/\s+/g, " ");

  return normalizedString
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const arraysEqual = (
  arr1: WorkingDaysTypes[],
  arr2: WorkingDaysTypes[]
) => {
  if (arr1.length !== arr2.length) return false;

  const sortedArr1 = [...arr1].sort((a, b) => a.day.localeCompare(b.day));
  const sortedArr2 = [...arr2].sort((a, b) => a.day.localeCompare(b.day));

  return sortedArr1.every(
    (item, index) =>
      item.day === sortedArr2[index].day && item.id === sortedArr2[index].id
  );
};

export const getHoursArray = (): DropdownListType[] =>
  Array.from({ length: HOURS_PER_DAY }, (_, i) => ({
    label: `${i + 1} hour${i === 0 ? "" : "s"}`,
    value: i + 1
  }));

export const isObjectEmpty = (obj: any): boolean => {
  const copyOfObject = Object.assign({}, obj);

  for (const key in copyOfObject) {
    if (typeof copyOfObject[key] === "object" && copyOfObject[key] !== null) {
      const result = isObjectEmpty(copyOfObject[key]);
      if (!result) return false;
    } else if (
      !(
        (typeof copyOfObject[key] === "string" && copyOfObject[key] === "") ||
        typeof copyOfObject[key] === "undefined" ||
        (Array.isArray(copyOfObject[key]) && copyOfObject[key].length === 0)
      )
    ) {
      return false;
    }
  }

  return true;
};

export const parseHexToRgb = (
  hex: string
): { r: number; g: number; b: number } => {
  hex = hex.replace(/^#/, "");

  if (![3, 6].includes(hex.length)) {
    throw new Error("Invalid hex color code");
  }

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return { r, g, b };
};

export const hexToRgb = (hex: string): string => {
  const { r, g, b } = parseHexToRgb(hex);

  return `rgb(${r}, ${g}, ${b})`;
};

export const scrollToFirstError = (theme: Theme) => {
  const errorColorContrastText = hexToRgb(theme.palette.error.contrastText);

  const allElements = document.querySelectorAll("body *");

  for (const element of allElements) {
    const style = getComputedStyle(element);
    if (style.color === errorColorContrastText) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      break;
    }
  }
};

export const scrollToTop = (top: number = 0) => {
  window.scrollTo({ top, behavior: "smooth" });
};

export const capitalizeFirstLetter = (string: string): string => {
  if (typeof string !== "string" || string.length === 0) {
    return string;
  }
  return string.charAt(0)?.toUpperCase() + string?.slice(1);
};

export const filterByValue = <T>(
  objectArray: T[],
  value: T[keyof T],
  element: keyof T
): T[] => {
  return objectArray?.filter((objItem: T) => objItem[element] !== value);
};

export const getJobRoleByJobRoleId = (
  selectedJobRoleId: number | string,
  jobRoles: JobFamilies[]
): string => {
  const jobRole = jobRoles?.find((role) =>
    role?.jobFamilyId === selectedJobRoleId ? role.name : ""
  );
  return jobRole?.name ?? "";
};

export const getJobLevelByJobLevelId = (
  selectedJobLevelId: number | string,
  jobRoles: JobFamilies[]
): string => {
  if (jobRoles) {
    for (const role of jobRoles) {
      const jobLevel = role?.jobTitles?.find(
        (level) => level?.jobTitleId === selectedJobLevelId
      );
      if (jobLevel) {
        return jobLevel?.name;
      }
    }
  }
  return "";
};

export const getJobLevelsByJobRoleId = (
  selectedJobRoleId: number | string,
  jobRoles: JobFamilies[]
): DropdownListType[] => {
  const jobRole = jobRoles.find((job) => job.jobFamilyId === selectedJobRoleId);

  if (jobRole) {
    return jobRole.jobTitles.map((level) => ({
      label: level.name,
      value: level.jobTitleId
    }));
  }

  return [];
};

export const monthAbbreviations = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

export const isWorkingDay = (
  date: Date | string,
  workingDays: DefaultDayCapacityType[] | WorkingDaysTypes[]
): boolean => {
  let dayOfWeek = "";
  if (typeof date === "string") dayOfWeek = date;
  else dayOfWeek = getShortDayName(date?.toISOString());

  return workingDays?.some(
    (day: DefaultDayCapacityType | WorkingDaysTypes) =>
      day.day === dayOfWeek.toUpperCase()
  );
};

export const testPassiveEventSupport = () => {
  let supportsPassive = false;

  try {
    const options = Object.defineProperty({}, "passive", {
      get: () => {
        supportsPassive = true;
        return supportsPassive;
      }
    });

    const noop = () => {}; // No-op function as a valid listener

    window?.addEventListener("testPassive", noop, options);
    window?.removeEventListener("testPassive", noop, options);
  } catch (error) {
    // Silencing the error is intentional.
    // This block is only used for feature detection.
  }

  return supportsPassive;
};

export const formatEmptyString = (string: string) => string || null;

export const formatPhoneNumber = (countryCode: string, phone: string) => {
  if (!countryCode || !phone) return "";
  return `${countryCode.trim()} ${phone.trim()}`;
};

export const formatDate = (dateString: string) => {
  if (!dateString) return null;
  return dateString?.toString().split("T")[0];
};

export const toCamelCase = (string: string): string => {
  if (!string) return "";

  const trimmed = string.trim();

  // If there are no separators, just ensure first char is lowercase
  if (!/[\s\-_]/.test(trimmed)) {
    return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
  }

  // Split by common delimiters and convert
  const words = trimmed.split(/[\s\-_]+/);
  return (
    words[0].toLowerCase() +
    words
      .slice(1)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("")
  );
};
export const flatListValues = (obj: Record<string, any>): any[] => {
  const result: any[] = [];

  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      if (key === "team" || key === "role") {
        const flattenedValues = obj[key].map(
          (item: { id: number; text: string }) => item.text
        );
        result.push(...flattenedValues);
      } else {
        result.push(...obj[key]);
      }
    } else {
      result.push(obj[key]);
    }
  }

  return result.filter((value) => value != null && value !== "");
};

export const decodeBase64 = (encoded: string): string => {
  return atob(encoded);
};

export const roundNumberToX = (num: number = 0, decimalPoint: number = 20) =>
  +num.toFixed(decimalPoint);

// The createWebSocketUrl function converts an API URL from HTTP/HTTPS to WebSocket (WS/WSS) by replacing the protocol and removing any version suffix. This ensures the WebSocket URL matches the security of the original API URL.
export const createWebSocketUrl = (endpoint: string) => {
  let apiUrl = process.env.NEXT_PUBLIC_API_URL;

  apiUrl = apiUrl?.replace(/\/v\d+$/, "");

  const wsUrl = apiUrl?.replace(/^http/, "ws");
  return `${wsUrl}${endpoint}`;
};

export const formatChartButtonList = ({
  colorList,
  labelList
}: {
  colorList: string[];
  labelList: string[];
}) => {
  const transformedData: Record<string, string> = {};
  labelList?.forEach((label, index) => {
    transformedData[label] = colorList[index];
  });
  return transformedData;
};

export const updateToggleState = ({
  buttonType,
  initialList = {}
}: {
  buttonType: string;
  initialList?: Record<string, boolean>;
}) => {
  const updatedToggle = {
    ...initialList,
    [buttonType]: !initialList[buttonType]
  };

  const reorderedKeys = Object.keys(updatedToggle).sort((a, b) => {
    if (updatedToggle[a] && !updatedToggle[b]) {
      return -1;
    } else if (!updatedToggle[a] && updatedToggle[b]) {
      return 1;
    }
    return 0;
  });

  const reorderedObj: Record<string, boolean> = {};

  reorderedKeys.forEach((key) => {
    reorderedObj[key] = updatedToggle[key];
  });

  return reorderedObj;
};

export function formatEnumString(input: string): string {
  return input
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export const downloadAttachmentToUserDevice = (attachment: FileUploadType) => {
  if (!attachment.file) {
    return;
  }

  const link = document.createElement("a");
  link.download = attachment.name;

  const reader = new FileReader();

  reader.onloadend = () => {
    link.href = reader.result as string;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  reader.onerror = () => {
    console.error("There was an error reading the file!");
  };

  reader.readAsDataURL(attachment.file);
};

export const checkRestrictedRoutesAndRedirect = (
  request: NextRequestWithAuth,
  restrictedRoutes: string[],
  requiredRole: string,
  roles: string[]
): NextResponse | null => {
  if (
    restrictedRoutes.some((url) => request.nextUrl.pathname.startsWith(url)) &&
    !roles.includes(requiredRole)
  ) {
    return NextResponse.redirect(
      new URL(ROUTES.AUTH.UNAUTHORIZED, request.url)
    );
  }
  return null;
};

export const getLabelForReadOnlyChip = (
  isBelow1024?: boolean,
  isResponsive?: boolean,
  label?: string
) => {
  if (label === undefined) {
    return "";
  } else if (isBelow1024 && isResponsive) {
    return label
      ?.split(" ")
      .slice(0, 2)
      .filter((word) => word !== undefined)
      .join(" ");
  }

  return label;
};

export const validateEnvelopeSearch = (input: string): string => {
  if (!input) return "";

  const emailPattern = matchInvalidEmailCharactersSearchPattern();
  const alphaNumericPattern = alphaNumericNamePatternWithSpecialCharacters();

  return input
    .split("")
    .filter((char) => {
      const isEmailChar = !emailPattern.test(char);
      const isAlphaNumericSpecialChar = alphaNumericPattern.test(char);
      return isEmailChar || isAlphaNumericSpecialChar;
    })
    .join("");
};
