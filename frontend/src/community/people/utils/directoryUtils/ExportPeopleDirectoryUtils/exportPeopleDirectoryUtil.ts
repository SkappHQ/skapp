interface EmployeePersonalInfo {
  birthDate?: string;
  bloodGroup?: string;
  nationality?: string;
  maritalStatus?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

interface TeamResponse {
  teamId: number;
  teamName: string;
}

interface Manager {
  firstName: string;
  lastName: string;
  employeeId?: string;
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

interface jobTitle {
  jobTitleId: number;
  name: string;
}

interface JobFamily {
  title: string;
  name: string;
}

interface EmployeeData {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
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
  gender?: string;
  address?: string;
  country?: string;
  isActive: boolean;
  employeePersonalInfoDto?: EmployeePersonalInfo;
  teamResponseDto?: TeamResponse[];
  managers?: Manager[];
  employeeEmergencyDto?: EmergencyContact[];
}

const CSV_FIELD_MAPPING = [
  {
    header: "Employee ID",
    accessor: (emp: EmployeeData) => emp.employeeId || ""
  },
  {
    header: "First Name",
    accessor: (emp: EmployeeData) => emp.firstName || ""
  },
  {
    header: "Last Name",
    accessor: (emp: EmployeeData) => emp.lastName || ""
  },
  {
    header: "Work Email",
    accessor: (emp: EmployeeData) => emp.email || ""
  },
  {
    header: "Personal Email",
    accessor: (emp: EmployeeData) => emp.personalEmail || ""
  },
  {
    header: "Phone",
    accessor: (emp: EmployeeData) => emp.phone || ""
  },
  {
    header: "Designation",
    accessor: (emp: EmployeeData) => emp.designation || ""
  },
  {
    header: "Job Title",
    accessor: (emp: EmployeeData) => emp?.jobTitle?.name || ""
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
    header: "Join Date",
    accessor: (emp: EmployeeData) => emp.joinDate || ""
  },
  {
    header: "Time Zone",
    accessor: (emp: EmployeeData) => emp.timeZone || ""
  },
  {
    header: "Work Hour Capacity",
    accessor: (emp: EmployeeData) => emp.workHourCapacity?.toString() || ""
  },
  {
    header: "Identification No",
    accessor: (emp: EmployeeData) => emp.identificationNo || ""
  },
  {
    header: "Gender",
    accessor: (emp: EmployeeData) => emp.gender || ""
  },
  {
    header: "Birth Date",
    accessor: (emp: EmployeeData) =>
      emp.employeePersonalInfoDto?.birthDate || ""
  },
  {
    header: "Blood Group",
    accessor: (emp: EmployeeData) =>
      emp.employeePersonalInfoDto?.bloodGroup || ""
  },
  {
    header: "Nationality",
    accessor: (emp: EmployeeData) =>
      emp.employeePersonalInfoDto?.nationality || ""
  },
  {
    header: "Marital Status",
    accessor: (emp: EmployeeData) =>
      emp.employeePersonalInfoDto?.maritalStatus || ""
  },
  {
    header: "Address",
    accessor: (emp: EmployeeData) => emp.address || ""
  },
  {
    header: "City",
    accessor: (emp: EmployeeData) => emp.employeePersonalInfoDto?.city || ""
  },
  {
    header: "State",
    accessor: (emp: EmployeeData) => emp.employeePersonalInfoDto?.state || ""
  },
  {
    header: "Country",
    accessor: (emp: EmployeeData) => emp.country || ""
  },
  {
    header: "Postal Code",
    accessor: (emp: EmployeeData) =>
      emp.employeePersonalInfoDto?.postalCode || ""
  },
  {
    header: "Teams",
    accessor: (emp: EmployeeData) =>
      emp.teamResponseDto
        ?.map((team: TeamResponse) => team.teamName)
        .join("; ") || ""
  },
  {
    header: "Managers",
    accessor: (emp: EmployeeData) =>
      emp.managers
        ?.map((manager: Manager) => `${manager.firstName} ${manager.lastName}`)
        .join("; ") || ""
  },
  {
    header: "Emergency Contacts",
    accessor: (emp: EmployeeData) =>
      emp.employeeEmergencyDto
        ?.map(
          (contact: EmergencyContact) =>
            `${contact.name} (${contact.relationship}) - ${contact.phone}`
        )
        .join("; ") || ""
  },
  {
    header: "Is Active",
    accessor: (emp: EmployeeData) => (emp.isActive ? "Yes" : "No")
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
    throw new Error(
      `Failed to export employee directory: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};
