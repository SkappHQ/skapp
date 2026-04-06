import { createCSV } from "~community/common/utils/bulkUploadUtils";
import { toCamelCase } from "~community/common/utils/commonUtil";
import {
  LeaveTypePayloadType,
  LeaveTypeType
} from "~community/leave/types/AddLeaveTypes";
import {
  LeaveEntitlementBulkUploadType,
  LeaveEntitlementType
} from "~community/leave/types/LeaveEntitlementTypes";
import { EmployeeDataType } from "~community/people/types/EmployeeTypes";

export const downloadLeaveEntitlementBulkUploadTemplate = (
  leaveTypes: LeaveTypePayloadType[] | [],
  employeeData: EmployeeDataType[] | []
) => {
  const headers = [
    "Employee ID",
    "Employee Name",
    "Employee Email",
    ...(leaveTypes?.map((type) => type?.name) ?? [])
  ];

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(headers.join(",") + "\n");
      for (const employeeDetails of employeeData) {
        const rowData = [
          employeeDetails?.employeeId,
          `${employeeDetails?.firstName} ${employeeDetails?.lastName}`,
          employeeDetails?.email
        ];
        controller.enqueue(rowData.join(",") + "\n");
      }

      controller.close();
    }
  });

  createCSV(stream, "leaveEntitlementsUpload");
};

export const validateHeaders = async (
  file: File,
  leaveTypes: LeaveTypePayloadType[]
): Promise<boolean> => {
  const readCSVHeaders = (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event?.target?.result as string;

        const headers = text
          .split("\n")[0]
          .split(",")
          .map((header) => header.trim());
        resolve(headers);
      };
      reader.onerror = () => reject(new Error("File reading error"));
      reader.readAsText(file);
    });
  };

  const includesInvalidHeaders = (headers: string[]): boolean => {
    const predefinedHeaders = [
      "Employee ID",
      "Employee Name",
      "Employee Email",
      ...(leaveTypes?.map((type) => type?.name) ?? [])
    ];
    return headers?.some((header) => !predefinedHeaders?.includes(header));
  };

  const headers = await readCSVHeaders(file);

  const isValid = !includesInvalidHeaders(headers);

  return isValid;
};

export const transformCSVHeaders = (header: string) => {
  return toCamelCase(header);
};

export const exportLeaveBulkList = (
  leaveEntitlementList: LeaveEntitlementType[],
  selectedYear: string
) => {
  const predefinedHeaders = ["Employee ID", "Employee Name", "Employee Email"];

  const leaveTypeHeaders = leaveEntitlementList?.[0]?.entitlements?.map(
    (entitlement) => entitlement?.name
  );

  const headers = [...predefinedHeaders, ...leaveTypeHeaders];

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(headers.join(",") + "\n");
      for (const leaveEntitlement of leaveEntitlementList) {
        const rowData = [
          leaveEntitlement?.employeeId,
          leaveEntitlement?.firstName + " " + leaveEntitlement?.lastName,
          leaveEntitlement?.email,
          ...leaveTypeHeaders.map((leaveType) => {
            const value = leaveEntitlement?.entitlements?.find(
              (entitlement) => entitlement?.name === leaveType
            )?.totalDaysAllocated;
            return value !== undefined ? String(value) : "";
          })
        ];
        controller.enqueue(rowData.join(",") + "\n");
      }
      controller.close();
    }
  });

  createCSV(stream, `LeaveEntitlements${selectedYear}`);
};

const getLeaveTypeNames = (
  leaveEntitlement: LeaveEntitlementBulkUploadType
) => {
  const leaveTypeNames = Object.keys(leaveEntitlement).filter(
    (key) => !["employeeId", "employeeName", "employeeEmail"].includes(key)
  );

  return leaveTypeNames;
};

const getLeaveEntitlementsForEmployee = (
  leaveEntitlement: LeaveEntitlementBulkUploadType,
  leaveTypes: LeaveTypeType[],
  selectedYear: string
) => {
  const leaveTypeNames = getLeaveTypeNames(leaveEntitlement);

  const entitlements = leaveTypeNames.map((leaveType) => {
    const leaveTypeDetails = leaveTypes?.find((type) => {
      return (
        type?.name?.replace(/[\s\-]+/g, "").toLowerCase() ===
        leaveType?.toLowerCase()
      );
    });

    return {
      leaveTypeId: leaveTypeDetails?.typeId ?? 0,
      name: leaveTypeDetails?.name ?? "",
      totalDaysAllocated: (
        leaveEntitlement as unknown as Record<string, string>
      )[leaveType],
      validFrom: `${selectedYear}-01-01`,
      validTo: `${selectedYear}-12-31`
    };
  });

  return entitlements;
};

export const createLeaveEntitlementBulkUploadPayload = (
  leaveEntitlement: LeaveEntitlementBulkUploadType[],
  leaveTypes: LeaveTypeType[],
  selectedYear: string
) => {
  const leaveEntitlementBulkUploadData = leaveEntitlement?.map(
    (entitlement) => {
      const entitlements = getLeaveEntitlementsForEmployee(
        entitlement,
        leaveTypes,
        selectedYear
      );

      return {
        employeeId: entitlement?.employeeId,
        employeeName: entitlement?.employeeName,
        email: entitlement?.employeeEmail,
        entitlements
      };
    }
  );

  return leaveEntitlementBulkUploadData;
};
