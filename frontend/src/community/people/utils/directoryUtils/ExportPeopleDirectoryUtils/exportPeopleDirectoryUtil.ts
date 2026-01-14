import { formatDateToISOString } from "~community/common/utils/dateTimeUtils";

interface EmployeeExtraInfo {
  allergies: string;
  dietaryRestrictions: string;
  tShirtSize: string;
}

interface EmployeeSocialMediaInfo {
  facebook: string;
  instagram: string;
  linkedIn: string;
  x: string;
}
interface EmployeePersonalInfo {
  birthDate?: string;
  bloodGroup?: string;
  nationality?: string;
  maritalStatus?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  ethnicity?: string;
  extraInfo?: EmployeeExtraInfo;
  socialMediaDetails?: EmployeeSocialMediaInfo;
  nin: string;
  passportNo: string;
  ssn: string;
}

interface TeamResponse {
  teamId: number;
  teamName: string;
}

interface Manager {
  email: string;
}

interface EmergencyContact {
  name: string;
  emergencyRelationship: string;
  contactNo: string;
  isPrimary: boolean;
}

interface jobTitle {
  jobTitleId: number;
  name: string;
}

interface JobFamily {
  title: string;
  name: string;
}

interface ProbationPeriod {
  startDate: string;
  endDate: string;
}

interface EmployeeData {
  employeeId: string;
  employeeNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  gender?: string;
  personalEmail?: string;
  phone?: string;
  designation?: string;
  jobTitle?: jobTitle;
  employmentType?: string;
  jobFamily?: JobFamily;
  joinDate?: string;
  timeZone?: string;
  workHourCapacity?: number;
  identificationNo?: string;
  addressLine1?: string;
  addressLine2?: string;
  country?: string;
  isActive: boolean;
  employmentAllocation: string;
  employeePersonalInfoDto?: EmployeePersonalInfo;
  teamResponseDto?: TeamResponse[];
  primarySupervisor?: Manager;
  probationPeriod: ProbationPeriod;
  employeeEmergencyDto?: EmergencyContact[];
  eeoJobCategory?: string;
}

const parsePhoneCountryCode = (phone?: string): string => {
  if (!phone) return "";
  return phone.split(/[\s-]/)[0] || "";
};

const parsePhoneNumber = (phone?: string): string => {
  if (!phone) return "";
  const parts = phone.split(/[\s-]/);
  return parts.slice(1).join(" ") || "";
};

// Helper function to get primary emergency contact
const getPrimaryEmergencyContact = (
  emp: EmployeeData
): EmergencyContact | null => {
  if (!emp.employeeEmergencyDto || emp.employeeEmergencyDto.length === 0) {
    return null;
  }

  return (
    emp.employeeEmergencyDto.find((contact) => contact.isPrimary === true) ||
    null
  );
};

const CSV_FIELD_MAPPING = [
  {
    header: "First name*",
    accessor: (emp: EmployeeData) => emp.firstName || ""
  },
  {
    header: "Middle name",
    accessor: (emp: EmployeeData) => emp.middleName || ""
  },
  {
    header: "Last name*",
    accessor: (emp: EmployeeData) => emp.lastName || ""
  },
  {
    header: "Work Email*",
    accessor: (emp: EmployeeData) => emp.email || ""
  },
  {
    header: "Gender",
    accessor: (emp: EmployeeData) => emp.gender || ""
  },
  {
    header: "Birthdate",
    accessor: (emp: EmployeeData) => {
      if (!emp.employeePersonalInfoDto?.birthDate) return "";
      return formatDateToISOString(
        new Date(emp.employeePersonalInfoDto.birthDate)
      );
    }
  },
  {
    header: "Nationality",
    accessor: (emp: EmployeeData) =>
      emp.employeePersonalInfoDto?.nationality || ""
  },
  {
    header: "NIN (National identification number)",
    accessor: (emp: EmployeeData) => emp.identificationNo || ""
  },
  {
    header: "Marital Status",
    accessor: (emp: EmployeeData) =>
      emp.employeePersonalInfoDto?.maritalStatus || ""
  },
  {
    header: "Personal Email",
    accessor: (emp: EmployeeData) => emp.personalEmail || ""
  },
  {
    header: "Contact No Country Code",
    accessor: (emp: EmployeeData) => {
      return parsePhoneCountryCode(emp.phone) || "";
    }
  },
  {
    header: "Contact No",
    accessor: (emp: EmployeeData) => {
      return parsePhoneNumber(emp.phone) || "";
    }
  },
  {
    header: "Address Line 1",
    accessor: (emp: EmployeeData) => emp.addressLine1 || ""
  },
  {
    header: "Address Line 2",
    accessor: (emp: EmployeeData) => emp.addressLine2 || ""
  },
  {
    header: "City",
    accessor: (emp: EmployeeData) => emp.employeePersonalInfoDto?.city || ""
  },
  {
    header: "Country",
    accessor: (emp: EmployeeData) => emp.country || ""
  },
  {
    header: "State / Province",
    accessor: (emp: EmployeeData) => emp.employeePersonalInfoDto?.state || ""
  },
  {
    header: "Postal Code",
    accessor: (emp: EmployeeData) =>
      emp.employeePersonalInfoDto?.postalCode || ""
  },
  {
    header: "LinkedIn",
    accessor: (emp: EmployeeData) =>
      emp.employeePersonalInfoDto?.socialMediaDetails?.linkedIn || ""
  },
  {
    header: "Facebook",
    accessor: (emp: EmployeeData) =>
      emp.employeePersonalInfoDto?.socialMediaDetails?.facebook || ""
  },
  {
    header: "Instagram",
    accessor: (emp: EmployeeData) =>
      emp.employeePersonalInfoDto?.socialMediaDetails?.instagram || ""
  },
  {
    header: "X (Twitter)",
    accessor: (emp: EmployeeData) =>
      emp.employeePersonalInfoDto?.socialMediaDetails?.x || ""
  },
  {
    header: "Blood Group",
    accessor: (emp: EmployeeData) =>
      emp.employeePersonalInfoDto?.bloodGroup || ""
  },
  {
    header: "Allergies",
    accessor: (emp: EmployeeData) =>
      emp.employeePersonalInfoDto?.extraInfo?.allergies || ""
  },
  {
    header: "Dietary Restrictions",
    accessor: (emp: EmployeeData) =>
      emp.employeePersonalInfoDto?.extraInfo?.dietaryRestrictions || ""
  },
  {
    header: "T Shirt Size",
    accessor: (emp: EmployeeData) =>
      emp.employeePersonalInfoDto?.extraInfo?.tShirtSize || ""
  },
  {
    header: "Emergency Contact Name",
    accessor: (emp: EmployeeData) => {
      const primaryContact = getPrimaryEmergencyContact(emp);
      return primaryContact?.name || "";
    }
  },
  {
    header: "Emergency Contact Relationship",
    accessor: (emp: EmployeeData) => {
      const primaryContact = getPrimaryEmergencyContact(emp);
      return primaryContact?.emergencyRelationship || "";
    }
  },
  {
    header: "Emergency Contact Country Code",
    accessor: (emp: EmployeeData) => {
      const primaryContact = getPrimaryEmergencyContact(emp);
      return parsePhoneCountryCode(primaryContact?.contactNo) || "";
    }
  },
  {
    header: "Emergency Contact Number",
    accessor: (emp: EmployeeData) => {
      const primaryContact = getPrimaryEmergencyContact(emp);
      return parsePhoneNumber(primaryContact?.contactNo) || "";
    }
  },
  {
    header: "Emp No",
    accessor: (emp: EmployeeData) => emp.employeeNumber || ""
  },
  {
    header: "Employment Allocation",
    accessor: (emp: EmployeeData) => emp.employmentAllocation || ""
  },
  {
    header: "Joined Date",
    accessor: (emp: EmployeeData) => {
      if (!emp.joinDate) return "";
      return formatDateToISOString(new Date(emp.joinDate));
    }
  },
  {
    header: "Teams",
    accessor: (emp: EmployeeData) =>
      emp.teamResponseDto
        ?.map((team: TeamResponse) => team.teamName)
        .join("; ") || ""
  },
  {
    header: "Primary Supervisor (Email)",
    accessor: (emp: EmployeeData) => emp.primarySupervisor?.email || ""
  },
  {
    header: "Probation Start Date",
    accessor: (emp: EmployeeData) => {
      if (!emp.probationPeriod?.startDate) return "";
      return formatDateToISOString(new Date(emp.probationPeriod.startDate));
    }
  },
  {
    header: "Probation End Date",
    accessor: (emp: EmployeeData) => {
      if (!emp.probationPeriod?.endDate) return "";
      return formatDateToISOString(new Date(emp.probationPeriod.endDate));
    }
  },
  {
    header: "Work Time Zone",
    accessor: (emp: EmployeeData) => emp.timeZone || ""
  },
  {
    header: "Employment Type",
    accessor: (emp: EmployeeData) => emp.employmentType || ""
  },
  {
    header: "Job Family",
    accessor: (emp: EmployeeData) => emp?.jobFamily?.name || ""
  },
  {
    header: "Job Title",
    accessor: (emp: EmployeeData) => emp?.jobTitle?.name || ""
  },
  {
    header: "Social Security No (SSN)",
    accessor: (emp: EmployeeData) => emp.employeePersonalInfoDto?.ssn || ""
  },
  {
    header: "Passport Number",
    accessor: (emp: EmployeeData) =>
      emp.employeePersonalInfoDto?.passportNo || ""
  },
  {
    header: "Ethnicity",
    accessor: (emp: EmployeeData) =>
      emp.employeePersonalInfoDto?.ethnicity || ""
  },
  {
    header: "EEO Job Category",
    accessor: (emp: EmployeeData) => emp.eeoJobCategory || ""
  }
] as const;

const escapeCsvField = (
  field: string | number | boolean | null | undefined
): string => {
  if (field === null || field === undefined) {
    return '""';
  }

  const stringValue = String(field).trim();

  const escapedValue = stringValue.replaceAll('"', '""');

  return `"${escapedValue}"`;
};

export const convertEmployeeDataToCSV = (employees: EmployeeData[]): string => {
  if (!employees || employees.length === 0) {
    return "";
  }

  const headers = CSV_FIELD_MAPPING.map((field) => field.header);

  const csvRows = employees.map((employee) => {
    return CSV_FIELD_MAPPING.map((field) => {
      const value = field.accessor(employee);
      return escapeCsvField(value);
    });
  });

  // Combine headers and rows
  const csvContent = [
    headers.map((header) => `"${header}"`).join(","),
    ...csvRows.map((row) => row.join(","))
  ].join("\n");

  return csvContent;
};

export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    try {
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      URL.revokeObjectURL(url);
    }
  }
};

export const exportEmployeeDirectoryToCSV = (
  employees: EmployeeData[],
  hasFilters?: boolean
): void => {
  try {
    const name = hasFilters ? "Filtered" : "AllActive";
    const csvContent = convertEmployeeDataToCSV(employees);
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const timeZone = now.toTimeString().split(" ")[1];
    const defaultFilename = `employee_directory_${name}_${now.toISOString().split("T")[0]}_${hours}-${minutes}_${timeZone}.csv`;
    downloadCSV(csvContent, defaultFilename);
  } catch (error) {
    console.error(error);
    throw new Error(
      `Failed to export employee directory: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};
