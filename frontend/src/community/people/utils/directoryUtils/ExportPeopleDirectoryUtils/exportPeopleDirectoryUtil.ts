export const convertEmployeeDataToCSV = (employees: any[]): string => {
  if (!employees || employees.length === 0) {
    return "";
  }

  // Define CSV headers
  const headers = [
    "Employee ID",
    "First Name",
    "Last Name",
    "Work Email",
    "Personal Email",
    "Phone",
    "Designation",
    "Job Title",
    "Employment Type",
    "Job Family",
    "Join Date",
    "Time Zone",
    "Work Hour Capacity",
    "Identification No",
    "Gender",
    "Birth Date",
    "Blood Group",
    "Nationality",
    "Marital Status",
    "Address",
    "City",
    "State",
    "Country",
    "Postal Code",
    "Teams",
    "Managers",
    "Emergency Contacts",
    "Is Active"
  ];

  // Convert data to CSV rows
  const csvRows = employees.map((employee) => {
    const personalInfo = employee.employeePersonalInfoDto || {};
    const teams =
      employee.teamResponseDto?.map((team: any) => team.teamName).join("; ") ||
      "";
    const managers =
      employee.managers
        ?.map((manager: any) => `${manager.firstName} ${manager.lastName}`)
        .join("; ") || "";
    const emergencyContacts =
      employee.employeeEmergencyDto
        ?.map(
          (contact: any) =>
            `${contact.name} (${contact.relationship}) - ${contact.phone}`
        )
        .join("; ") || "";

    return [
      employee.employeeId || "",
      employee.firstName || "",
      employee.lastName || "",
      employee.email || "",
      employee.personalEmail || "",
      employee.phone || "",
      employee.designation || "",
      employee.jobTitle || "",
      employee.employmentType || "",
      employee.jobFamily || "",
      employee.joinDate || "",
      employee.timeZone || "",
      employee.workHourCapacity || "",
      employee.identificationNo || "",
      employee.gender || "",
      personalInfo.birthDate || "",
      personalInfo.bloodGroup || "",
      personalInfo.nationality || "",
      personalInfo.maritalStatus || "",
      employee.address || "",
      personalInfo.city || "",
      personalInfo.state || "",
      employee.country || "",
      personalInfo.postalCode || "",
      teams,
      managers,
      emergencyContacts,
      employee.isActive ? "Yes" : "No"
    ].map((field) => `"${String(field).replace(/"/g, '""')}"`); // Escape quotes and wrap in quotes
  });

  // Combine headers and rows
  const csvContent = [
    headers.map((header) => `"${header}"`).join(","),
    ...csvRows.map((row) => row.join(","))
  ].join("\n");

  return csvContent;
};

export const downloadCSV = (
  csvContent: string,
  filename: string = "employee_directory.csv"
): void => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export const exportEmployeeDirectoryToCSV = (
  employees: any[],
  hasFilters?: boolean
): void => {
  try {
    const name = hasFilters ? "Filtered" : "AllActive";
    const csvContent = convertEmployeeDataToCSV(employees);
    const now = new Date();
    const defaultFilename = `employee_directory_${name}_${now.toISOString().split("T")[0]}_${now.toString().split(" ")[4].replace(/:/g, "-")}_${now.toString().split(" ")[5]}.csv`;
    downloadCSV(csvContent, defaultFilename);
  } catch (error) {
    throw new Error("Failed to export employee directory");
  }
};
