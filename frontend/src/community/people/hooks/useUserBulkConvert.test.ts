import { AccountStatus } from "~community/leave/types/LeaveTypes";
import { SystemPermissionTypes } from "~community/people/types/AddNewResourceTypes";
import { RelationshipTypes } from "~community/people/types/EmployeeTypes";

import useUserBulkConvert from "./useUserBulkConvert";

describe("useUserBulkConvert", () => {
  const { convertUsers } = useUserBulkConvert();

  const mockJobRoleList = [
    {
      name: "Engineering",
      jobFamilyId: "1",
      jobTitles: [{ name: "Software Engineer", jobTitleId: "101" }]
    },
    {
      name: "HR",
      jobFamilyId: "2",
      jobTitles: [{ name: "HR Manager", jobTitleId: "201" }]
    }
  ];

  it("should return an empty array when no users are provided", () => {
    const result = convertUsers([], mockJobRoleList);
    expect(result).toEqual([]);
  });

});
