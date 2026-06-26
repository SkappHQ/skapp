import { FormikProps } from "formik";
import { ChangeEvent } from "react";

import {
  EmployeeEmploymentDetailsFormTypes,
  EmploymentAllocationTypes,
  GenderTypes,
  RelationshipTypes,
  SystemPermissionTypes
} from "../types/AddNewResourceTypes";
import { EditAllInformationType } from "../types/EditEmployeeInfoTypes";
import { EmploymentStatusTypes } from "../types/EmployeeTypes";
import {
  handleManagerSelect,
  onManagerSearchChange,
  superAdminRedirectSteps
} from "./addNewResourceFunctions";

describe("Manager Utility Functions", () => {
  describe("handleManagerSelect", () => {
    const mockUser = {
      employeeId: 123,
      firstName: "John",
      lastName: "Doe",
      avatarUrl: "http://example.com/avatar.jpg",
      employeeName: "John Doe"
    };

    const mockFormik: FormikProps<EmployeeEmploymentDetailsFormTypes> = {
      values: {
        employeeNumber: "EMP123",
        workEmail: "john@company.com",
        employmentAllocation: EmploymentAllocationTypes.FULL_TIME,
        teams: [1, 2],
        employmentStatus: EmploymentStatusTypes.ACTIVE,
        primarySupervisor: {
          employeeId: "456",
          firstName: "Manager",
          lastName: "One",
          avatarUrl: ""
        },
        secondarySupervisor: {
          employeeId: "789",
          firstName: "Manager",
          lastName: "Two",
          avatarUrl: ""
        },
        joinedDate: "2023-01-01",
        probationStartDate: "2023-01-01",
        probationEndDate: "2023-07-01",
        workTimeZone: "UTC"
      },
      errors: {},
      touched: {},
      isSubmitting: false,
      isValidating: false,
      submitCount: 0,
      setFieldError: jest.fn(),
      setFieldValue: jest.fn(),
      setTouched: jest.fn(),
      validateForm: jest.fn(),
      validateField: jest.fn(),
      handleSubmit: jest.fn(),
      handleChange: jest.fn(),
      handleBlur: jest.fn(),
      resetForm: jest.fn(),
      setStatus: jest.fn(),
      setFormikState: jest.fn()
    };

    const mockSearchTermSetter = jest.fn();
    const mockSetSupervisor = jest.fn();
    const mockSetIsPopperOpen = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should handle manager selection with complete data", async () => {
      await handleManagerSelect({
        user: mockUser,
        fieldName: "primarySupervisor",
        formik: mockFormik,
        searchTermSetter: mockSearchTermSetter,
        setSupervisor: mockSetSupervisor,
        setIsPopperOpen: mockSetIsPopperOpen
      });

      expect(mockSearchTermSetter).toHaveBeenCalledWith("");
      expect(mockFormik.setFieldError).toHaveBeenCalledWith(
        "primarySupervisor",
        ""
      );
      expect(mockFormik.setFieldValue).toHaveBeenCalledWith(
        "primarySupervisor",
        123
      );
      expect(mockSetSupervisor).toHaveBeenCalledWith("primarySupervisor", {
        employeeId: "123",
        firstName: "John",
        lastName: "Doe",
        avatarUrl: "http://example.com/avatar.jpg"
      });
      expect(mockSetIsPopperOpen).toHaveBeenCalledWith(false);
    });

    it("should handle manager selection without avatar URL", async () => {
      const userWithoutAvatar = {
        employeeId: 123,
        firstName: "John",
        lastName: "Doe",
        avatarUrl: "",
        employeeName: "John Doe"
      };

      await handleManagerSelect({
        user: userWithoutAvatar,
        fieldName: "primarySupervisor",
        formik: mockFormik,
        searchTermSetter: mockSearchTermSetter,
        setSupervisor: mockSetSupervisor,
        setIsPopperOpen: mockSetIsPopperOpen
      });

      expect(mockSetSupervisor).toHaveBeenCalledWith("primarySupervisor", {
        employeeId: "123",
        firstName: "John",
        lastName: "Doe",
        avatarUrl: ""
      });
    });
  });

  describe("onManagerSearchChange", () => {
    const mockSetManagerSearchTerm = jest.fn();
    const mockFormik: FormikProps<EmployeeEmploymentDetailsFormTypes> = {
      values: {
        employeeNumber: "EMP123",
        workEmail: "john@company.com",
        employmentAllocation: EmploymentAllocationTypes.FULL_TIME,
        teams: [1, 2],
        employmentStatus: EmploymentStatusTypes.ACTIVE,
        primarySupervisor: {
          employeeId: "456",
          firstName: "Manager",
          lastName: "One",
          avatarUrl: ""
        },
        secondarySupervisor: {
          employeeId: "789",
          firstName: "Manager",
          lastName: "Two",
          avatarUrl: ""
        },
        joinedDate: "2023-01-01",
        probationStartDate: "2023-01-01",
        probationEndDate: "2023-07-01",
        workTimeZone: "UTC"
      },
      errors: {},
      touched: {},
      isSubmitting: false,
      isValidating: false,
      submitCount: 0,
      setFieldError: jest.fn(),
      setFieldValue: jest.fn(),
      setTouched: jest.fn(),
      validateForm: jest.fn(),
      validateField: jest.fn(),
      handleSubmit: jest.fn(),
      handleChange: jest.fn(),
      handleBlur: jest.fn(),
      resetForm: jest.fn(),
      setStatus: jest.fn(),
      setFormikState: jest.fn()
    };

    const mockSetSupervisor = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should handle search term change and clear existing selection", async () => {
      const mockEvent = {
        target: {
          value: " John Doe "
        }
      };

      await onManagerSearchChange({
        managerType: "primarySupervisor",
        e: mockEvent,
        setManagerSearchTerm: mockSetManagerSearchTerm,
        formik: mockFormik,
        setSupervisor: mockSetSupervisor
      });

      expect(mockFormik.setFieldValue).toHaveBeenCalledWith(
        "primarySupervisor",
        ""
      );
      expect(mockSetSupervisor).toHaveBeenCalledWith("primarySupervisor", {
        employeeId: "",
        firstName: "",
        lastName: "",
        avatarUrl: ""
      });
    });

    it("should handle empty search term", async () => {
      const mockEvent = {
        target: {
          value: "   ",
          name: "primarySupervisor"
        },
        currentTarget: {
          value: "   ",
          name: "primarySupervisor"
        },
        nativeEvent: {},
        bubbles: false,
        cancelable: true,
        isTrusted: true
      } as ChangeEvent<HTMLInputElement>;

      await onManagerSearchChange({
        managerType: "primarySupervisor",
        e: mockEvent,
        setManagerSearchTerm: mockSetManagerSearchTerm,
        formik: mockFormik,
        setSupervisor: mockSetSupervisor
      });

      expect(mockSetManagerSearchTerm).toHaveBeenCalledWith("");
    });
  });

  describe("superAdminRedirectSteps", () => {
    const validGeneralDetails = {
      firstName: "John",
      lastName: "Doe",
      middleName: "Middle",
      gender: GenderTypes.MALE,
      birthDate: "1990-01-01",
      nationality: "US",
      maritalStatus: "Single",
      authPic: "picture.jpg",
      nin: "123456789",
      passportNumber: "AB123456"
    };

    const validContactDetails = {
      personalEmail: "john@example.com",
      countryCode: "+1",
      phone: "1234567890",
      addressLine1: "123 Main St",
      addressLine2: "Apt 4B",
      postalCode: "10001",
      city: "New York",
      country: "US",
      state: "NY"
    };

    const validEmergencyDetails = {
      primaryEmergencyContact: {
        name: "Jane Doe",
        relationship: RelationshipTypes.SPOUSE,
        countryCode: "+1",
        phone: "9876543210"
      },
      secondaryEmergencyContact: {
        name: "John Smith",
        relationship: RelationshipTypes.FRIEND,
        countryCode: "+1",
        phone: "1122334455"
      }
    };

    const validEmploymentDetails = {
      employeeNumber: "EMP123",
      workEmail: "john@company.com",
      employmentStatus: EmploymentStatusTypes.ACTIVE,
      employmentAllocation: EmploymentAllocationTypes.FULL_TIME,
      systemPermission: SystemPermissionTypes.EMPLOYEES,
      teams: [1, 2],
      primarySupervisor: {
        employeeId: "456",
        firstName: "Manager",
        lastName: "One",
        avatarUrl: ""
      },
      secondarySupervisor: {
        employeeId: "789",
        firstName: "Manager",
        lastName: "Two",
        avatarUrl: ""
      },
      joinedDate: "2023-01-01",
      probationStartDate: "2023-01-01",
      probationEndDate: "2023-07-01",
      workTimeZone: "UTC"
    };

    it("should return personal when general details are incomplete", () => {
      const incompleteGeneralDetails = {
        ...validGeneralDetails,
        firstName: ""
      };
      const result = superAdminRedirectSteps(
        incompleteGeneralDetails,
        validContactDetails,
        validEmergencyDetails,
        validEmploymentDetails
      );
      expect(result).toBe(EditAllInformationType.personal);
    });

    it("should return personal when contact details are incomplete", () => {
      const incompleteContactDetails = { ...validContactDetails, phone: "" };
      const result = superAdminRedirectSteps(
        validGeneralDetails,
        incompleteContactDetails,
        validEmergencyDetails,
        validEmploymentDetails
      );
      expect(result).toBe(EditAllInformationType.personal);
    });

    it("should return emergency when primary emergency contact is incomplete", () => {
      const incompleteEmergencyDetails = {
        ...validEmergencyDetails,
        primaryEmergencyContact: {
          ...validEmergencyDetails.primaryEmergencyContact,
          phone: ""
        }
      };
      const result = superAdminRedirectSteps(
        validGeneralDetails,
        validContactDetails,
        incompleteEmergencyDetails,
        validEmploymentDetails
      );
      expect(result).toBe(EditAllInformationType.emergency);
    });

    it("should return employment when employment details are incomplete", () => {
      const incompleteEmploymentDetails = {
        ...validEmploymentDetails,
        workEmail: ""
      };
      const result = superAdminRedirectSteps(
        validGeneralDetails,
        validContactDetails,
        validEmergencyDetails,
        incompleteEmploymentDetails
      );
      expect(result).toBe(EditAllInformationType.employment);
    });

    it("should return null when all details are complete", () => {
      const result = superAdminRedirectSteps(
        validGeneralDetails,
        validContactDetails,
        validEmergencyDetails,
        validEmploymentDetails
      );
      expect(result).toBeNull();
    });
  });
});
