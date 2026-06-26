import {
  handleCustomChangeDefault,
  handleModalClose,
  handleSuperAdminChangeEnterprise,
  handleSystemPermissionFormSubmit
} from "./systemPermissionFormUtils";

describe("handleCustomChangeDefault", () => {
  it("should update field value and user roles correctly", () => {
    const setFieldValue = jest.fn();
    const setUserRoles = jest.fn();

    handleCustomChangeDefault({
      name: "peopleRole",
      value: "PEOPLE_ADMIN",
      setFieldValue,
      setUserRoles
    });

    expect(setFieldValue).toHaveBeenCalledWith("peopleRole", "PEOPLE_ADMIN");
    expect(setUserRoles).toHaveBeenCalledWith("peopleRole", "PEOPLE_ADMIN");
  });

  it("should handle isSuperAdmin role correctly", () => {
    const setFieldValue = jest.fn();
    const setUserRoles = jest.fn();

    handleCustomChangeDefault({
      name: "isSuperAdmin",
      value: true,
      setFieldValue,
      setUserRoles
    });

    expect(setFieldValue).toHaveBeenCalledWith("isSuperAdmin", true);
    expect(setUserRoles).toHaveBeenCalledWith("isSuperAdmin", true);
  });

  it("should handle leaveRole correctly", () => {
    const setFieldValue = jest.fn();
    const setUserRoles = jest.fn();

    handleCustomChangeDefault({
      name: "leaveRole",
      value: "LEAVE_ADMIN",
      setFieldValue,
      setUserRoles
    });

    expect(setFieldValue).toHaveBeenCalledWith("leaveRole", "LEAVE_ADMIN");
    expect(setUserRoles).toHaveBeenCalledWith("leaveRole", "LEAVE_ADMIN");
  });

  it("should handle attendanceRole correctly", () => {
    const setFieldValue = jest.fn();
    const setUserRoles = jest.fn();

    handleCustomChangeDefault({
      name: "attendanceRole",
      value: "ATTENDANCE_ADMIN",
      setFieldValue,
      setUserRoles
    });

    expect(setFieldValue).toHaveBeenCalledWith(
      "attendanceRole",
      "ATTENDANCE_ADMIN"
    );
    expect(setUserRoles).toHaveBeenCalledWith(
      "attendanceRole",
      "ATTENDANCE_ADMIN"
    );
  });

  it("should handle esignRole correctly", () => {
    const setFieldValue = jest.fn();
    const setUserRoles = jest.fn();

    handleCustomChangeDefault({
      name: "esignRole",
      value: "ESIGN_ADMIN",
      setFieldValue,
      setUserRoles
    });

    expect(setFieldValue).toHaveBeenCalledWith("esignRole", "ESIGN_ADMIN");
    expect(setUserRoles).toHaveBeenCalledWith("esignRole", "ESIGN_ADMIN");
  });
});

describe("handleModalClose", () => {
  it("should reset roles and close the modal", () => {
    const setUserRoles = jest.fn();
    const setFieldValue = jest.fn();
    const setModalDescription = jest.fn();
    const setOpenModal = jest.fn();

    const employee = {
      userRoles: {
        isSuperAdmin: true,
        peopleRole: "PEOPLE_ADMIN",
        leaveRole: "LEAVE_ADMIN",
        attendanceRole: "ATTENDANCE_ADMIN"
      }
    };

    handleModalClose({
      employee,
      setUserRoles,
      setFieldValue,
      setModalDescription,
      setOpenModal
    });

    expect(setUserRoles).toHaveBeenCalledWith("isSuperAdmin", true);
    expect(setFieldValue).toHaveBeenCalledWith("isSuperAdmin", true);
    expect(setUserRoles).toHaveBeenCalledWith("peopleRole", "PEOPLE_ADMIN");
    expect(setFieldValue).toHaveBeenCalledWith("peopleRole", "PEOPLE_ADMIN");
    expect(setUserRoles).toHaveBeenCalledWith("leaveRole", "LEAVE_ADMIN");
    expect(setFieldValue).toHaveBeenCalledWith("leaveRole", "LEAVE_ADMIN");
    expect(setUserRoles).toHaveBeenCalledWith(
      "attendanceRole",
      "ATTENDANCE_ADMIN"
    );
    expect(setFieldValue).toHaveBeenCalledWith(
      "attendanceRole",
      "ATTENDANCE_ADMIN"
    );
    expect(setModalDescription).toHaveBeenCalledWith("");
    expect(setOpenModal).toHaveBeenCalledWith(false);
  });

  it("should handle undefined employee gracefully", () => {
    const setUserRoles = jest.fn();
    const setFieldValue = jest.fn();
    const setModalDescription = jest.fn();
    const setOpenModal = jest.fn();

    handleModalClose({
      employee: undefined,
      setUserRoles,
      setFieldValue,
      setModalDescription,
      setOpenModal
    });

    expect(setUserRoles).not.toHaveBeenCalled();
    expect(setFieldValue).not.toHaveBeenCalled();
    expect(setModalDescription).toHaveBeenCalledWith("");
    expect(setOpenModal).toHaveBeenCalledWith(false);
  });
});

describe("handleSuperAdminChangeEnterprise", () => {
  it("should show an error toast if superAdminCount is 1 and unchecked", async () => {
    const setFieldValue = jest.fn();
    const setUserRoles = jest.fn();
    const setToastMessage = jest.fn();
    const roleLimitationText = jest.fn((keys) => keys.join(","));

    const event = { target: { checked: false } } as any;

    await handleSuperAdminChangeEnterprise({
      event,
      setFieldValue,
      setUserRoles,
      setToastMessage,
      roleLimitationText,
      roleLimits: { superAdminLimitExceeded: false },
      superAdminCount: 1
    });

    expect(setToastMessage).toHaveBeenCalledWith({
      open: true,
      toastType: "error",
      title: "superAdminRequiredTitle",
      description: "superAdminRequiredDescription",
      isIcon: true
    });
    expect(setFieldValue).not.toHaveBeenCalled();
    expect(setUserRoles).not.toHaveBeenCalled();
  });

  it("should show an error toast if superAdminLimitExceeded is true and checked", async () => {
    const setFieldValue = jest.fn();
    const setUserRoles = jest.fn();
    const setToastMessage = jest.fn();
    const roleLimitationText = jest.fn((keys) => keys.join(","));

    const event = { target: { checked: true } } as any;

    await handleSuperAdminChangeEnterprise({
      event,
      setFieldValue,
      setUserRoles,
      setToastMessage,
      roleLimitationText,
      roleLimits: { superAdminLimitExceeded: true },
      superAdminCount: 0
    });

    expect(setToastMessage).toHaveBeenCalledWith({
      open: true,
      toastType: "error",
      title: "superAdminLimitationTitle",
      description: "superAdminLimitationDescription",
      isIcon: true
    });
    expect(setFieldValue).not.toHaveBeenCalled();
    expect(setUserRoles).not.toHaveBeenCalled();
  });

  it("should set roles and field values correctly when checked and limits are not exceeded", async () => {
    const setFieldValue = jest.fn();
    const setUserRoles = jest.fn();
    const setToastMessage = jest.fn();
    const roleLimitationText = jest.fn();

    const event = { target: { checked: true } } as any;

    await handleSuperAdminChangeEnterprise({
      event,
      setFieldValue,
      setUserRoles,
      setToastMessage,
      roleLimitationText,
      roleLimits: { superAdminLimitExceeded: false },
      superAdminCount: 0
    });

    expect(setFieldValue).toHaveBeenCalledWith("isSuperAdmin", true);
    expect(setUserRoles).toHaveBeenCalledWith("isSuperAdmin", true);
    expect(setFieldValue).toHaveBeenCalledWith("peopleRole", "PEOPLE_ADMIN");
    expect(setFieldValue).toHaveBeenCalledWith("leaveRole", "LEAVE_ADMIN");
    expect(setFieldValue).toHaveBeenCalledWith(
      "attendanceRole",
      "ATTENDANCE_ADMIN"
    );
    expect(setFieldValue).toHaveBeenCalledWith("esignRole", "ESIGN_ADMIN");
    expect(setUserRoles).toHaveBeenCalledWith("peopleRole", "PEOPLE_ADMIN");
    expect(setUserRoles).toHaveBeenCalledWith("leaveRole", "LEAVE_ADMIN");
    expect(setUserRoles).toHaveBeenCalledWith(
      "attendanceRole",
      "ATTENDANCE_ADMIN"
    );
    expect(setUserRoles).toHaveBeenCalledWith("esignRole", "ESIGN_ADMIN");
  });

  it("should unset isSuperAdmin and not set other roles when unchecked", async () => {
    const setFieldValue = jest.fn();
    const setUserRoles = jest.fn();
    const setToastMessage = jest.fn();
    const roleLimitationText = jest.fn();

    const event = { target: { checked: false } } as any;

    await handleSuperAdminChangeEnterprise({
      event,
      setFieldValue,
      setUserRoles,
      setToastMessage,
      roleLimitationText,
      roleLimits: { superAdminLimitExceeded: false },
      superAdminCount: 2
    });

    expect(setFieldValue).toHaveBeenCalledWith("isSuperAdmin", false);
    expect(setUserRoles).toHaveBeenCalledWith("isSuperAdmin", false);
    expect(setFieldValue).not.toHaveBeenCalledWith(
      "PEOPLE_ADMIN",
      expect.anything()
    );
    expect(setFieldValue).not.toHaveBeenCalledWith(
      "LEAVE_ADMIN",
      expect.anything()
    );
    expect(setFieldValue).not.toHaveBeenCalledWith(
      "ATTENDANCE_ADMIN",
      expect.anything()
    );
    expect(setFieldValue).not.toHaveBeenCalledWith(
      "ESIGN_ADMIN",
      expect.anything()
    );
  });
});

describe("handleSystemPermissionFormSubmit", () => {
  it("should set all roles correctly when values are provided", () => {
    const setUserRoles = jest.fn();
    const values = {
      isSuperAdmin: true,
      attendanceRole: "ATTENDANCE_ADMIN",
      peopleRole: "PEOPLE_ADMIN",
      leaveRole: "LEAVE_ADMIN",
      esignRole: "ESIGN_ADMIN"
    };

    handleSystemPermissionFormSubmit({ values, setUserRoles });

    expect(setUserRoles).toHaveBeenCalledWith("isSuperAdmin", true);
    expect(setUserRoles).toHaveBeenCalledWith(
      "attendanceRole",
      "ATTENDANCE_ADMIN"
    );
    expect(setUserRoles).toHaveBeenCalledWith("peopleRole", "PEOPLE_ADMIN");
    expect(setUserRoles).toHaveBeenCalledWith("leaveRole", "LEAVE_ADMIN");
    expect(setUserRoles).toHaveBeenCalledWith("esignRole", "ESIGN_ADMIN");
  });

  it("should handle missing roles gracefully", () => {
    const setUserRoles = jest.fn();
    const values = {
      isSuperAdmin: false,
      attendanceRole: undefined,
      peopleRole: undefined,
      leaveRole: undefined,
      esignRole: undefined
    };

    handleSystemPermissionFormSubmit({ values, setUserRoles });

    expect(setUserRoles).toHaveBeenCalledWith("isSuperAdmin", false);
    expect(setUserRoles).toHaveBeenCalledWith("attendanceRole", undefined);
    expect(setUserRoles).toHaveBeenCalledWith("peopleRole", undefined);
    expect(setUserRoles).toHaveBeenCalledWith("leaveRole", undefined);
    expect(setUserRoles).toHaveBeenCalledWith("esignRole", undefined);
  });

  it("should not skip any roles even if some are null", () => {
    const setUserRoles = jest.fn();
    const values = {
      isSuperAdmin: null,
      attendanceRole: "ATTENDANCE_ADMIN",
      peopleRole: null,
      leaveRole: "LEAVE_ADMIN",
      esignRole: null
    };

    handleSystemPermissionFormSubmit({ values, setUserRoles });

    expect(setUserRoles).toHaveBeenCalledWith("isSuperAdmin", null);
    expect(setUserRoles).toHaveBeenCalledWith(
      "attendanceRole",
      "ATTENDANCE_ADMIN"
    );
    expect(setUserRoles).toHaveBeenCalledWith("peopleRole", null);
    expect(setUserRoles).toHaveBeenCalledWith("leaveRole", "LEAVE_ADMIN");
    expect(setUserRoles).toHaveBeenCalledWith("esignRole", null);
  });
});
