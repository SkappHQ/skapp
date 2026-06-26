import { ManagerTypes } from "~community/common/types/CommonTypes";
import { Role } from "~community/people/types/EmployeeTypes";

import {
  GetFamilyFilterPreProcessor,
  GetTeamPreProcessor,
  isDemoteUser,
  refactorSupervisorAvatars,
  refactorTeamListData,
  sortSupervisorAvatars
} from "./PeopleDirectoryUtils";

describe("sortSupervisorAvatars", () => {
  it("should sort avatars by manager type and primary manager status", () => {
    const avatars = [
      {
        firstName: "John",
        managerType: ManagerTypes.PRIMARY,
        primaryManager: false
      },
      {
        firstName: "Alice",
        managerType: ManagerTypes.SECONDARY,
        primaryManager: true
      },
      {
        firstName: "Bob",
        managerType: ManagerTypes.PRIMARY,
        primaryManager: true
      }
    ];

    const result = sortSupervisorAvatars(avatars);

    expect(result[0].firstName).toBe("Bob");
    expect(result[1].firstName).toBe("Alice");
    expect(result[2].firstName).toBe("John");
  });

  it("should handle empty array", () => {
    expect(sortSupervisorAvatars([])).toEqual([]);
  });
});

describe("refactorSupervisorAvatars", () => {
  it("should refactor supervisor data to avatar props", () => {
    const supervisors = [
      {
        manager: {
          authPic: "pic.jpg",
          firstName: "John",
          lastName: "Doe"
        },
        primaryManager: true,
        managerType: ManagerTypes.PRIMARY
      }
    ];

    const result = refactorSupervisorAvatars(supervisors);

    expect(result[0]).toEqual({
      image: "pic.jpg",
      firstName: "John",
      lastName: "Doe",
      primaryManager: undefined,
      managerType: ManagerTypes.PRIMARY
    });
  });

  it("should handle missing data with default values", () => {
    const supervisors = [{ manager: {} }];

    const result = refactorSupervisorAvatars(supervisors);

    expect(result[0]).toEqual({
      image: "",
      firstName: "",
      lastName: "",
      primaryManager: undefined,
      managerType: undefined
    });
  });
});

describe("refactorTeamListData", () => {
  it("should return first team name and other team count", () => {
    const teams = [
      { team: { teamName: "Team A" } },
      { team: { teamName: "Team B" } },
      { team: { teamName: "Team C" } }
    ];

    const result = refactorTeamListData(teams);

    expect(result).toEqual({
      firstTeamName: "Team A",
      otherTeamCount: 2
    });
  });

  it("should handle empty team list", () => {
    const result = refactorTeamListData([]);

    expect(result).toEqual({
      firstTeamName: undefined,
      otherTeamCount: -1
    });
  });
});

describe("GetTeamPreProcessor", () => {
  it("should transform team list to button types", () => {
    const teams = [
      { teamId: 1, teamName: "Team A" },
      { teamId: 2, teamName: "Team B" }
    ];

    const result = GetTeamPreProcessor(teams);

    expect(result).toEqual([
      { id: "1", text: "Team A" },
      { id: "2", text: "Team B" }
    ]);
  });
});

describe("GetFamilyFilterPreProcessor", () => {
  it("should transform job family list to button types", () => {
    const jobFamilies = [
      { jobFamilyId: "jf1", name: "Engineering" },
      { jobFamilyId: "jf2", name: "Design" }
    ];

    const result = GetFamilyFilterPreProcessor(jobFamilies);

    expect(result).toEqual([
      { id: "jf1", text: "Engineering" },
      { id: "jf2", text: "Design" }
    ]);
  });
});

describe("isDemoteUser", () => {
  const baseEmployee = {
    userRoles: {
      peopleRole: Role.PEOPLE_ADMIN,
      leaveRole: Role.LEAVE_ADMIN,
      attendanceRole: Role.ATTENDANCE_ADMIN
    }
  };

  it("should detect people role demotion", () => {
    const values = {
      peopleRole: Role.PEOPLE_EMPLOYEE,
      leaveRole: Role.LEAVE_ADMIN,
      attendanceRole: Role.ATTENDANCE_ADMIN
    };

    expect(isDemoteUser(baseEmployee, values)).toBe(true);
  });

  it("should detect leave role demotion", () => {
    const values = {
      peopleRole: Role.PEOPLE_ADMIN,
      leaveRole: Role.LEAVE_EMPLOYEE,
      attendanceRole: Role.ATTENDANCE_ADMIN
    };

    expect(isDemoteUser(baseEmployee, values)).toBe(true);
  });

  it("should detect attendance role demotion", () => {
    const values = {
      peopleRole: Role.PEOPLE_ADMIN,
      leaveRole: Role.LEAVE_ADMIN,
      attendanceRole: Role.ATTENDANCE_EMPLOYEE
    };

    expect(isDemoteUser(baseEmployee, values)).toBe(true);
  });

  it("should return false when no demotion occurs", () => {
    const values = {
      peopleRole: Role.PEOPLE_ADMIN,
      leaveRole: Role.LEAVE_ADMIN,
      attendanceRole: Role.ATTENDANCE_ADMIN
    };

    expect(isDemoteUser(baseEmployee, values)).toBe(false);
  });

  it("should handle undefined employee", () => {
    const values = {
      peopleRole: Role.PEOPLE_ADMIN,
      leaveRole: Role.LEAVE_ADMIN,
      attendanceRole: Role.ATTENDANCE_ADMIN
    };

    expect(isDemoteUser(undefined, values)).toBe(false);
  });
});
