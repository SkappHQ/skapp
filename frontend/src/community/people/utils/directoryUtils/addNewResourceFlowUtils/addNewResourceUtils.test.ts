import ROUTES from "~community/common/constants/routes";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { DiscardTypeEnums } from "~community/people/enums/DirectoryEnums";

import {
  handleAddNewResourceSuccess,
  handleError,
  handleGoBack
} from "./addNewResourceUtils";

describe("handleGoBack", () => {
  const mockRouter = { push: jest.fn() } as any;
  const mockSetIsDiscardChangesModal = jest.fn();
  const mockGetEmployeeObject = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should navigate to directory if discard changes modal is open", async () => {
    await handleGoBack({
      activeStep: 1,
      isDiscardChangesModal: {
        isModalOpen: true,
        modalType: DiscardTypeEnums.DISCARD_FORM,
        modalOpenedFrom: ""
      },
      setIsDiscardChangesModal: mockSetIsDiscardChangesModal,
      router: mockRouter,
      getEmployeeObject: mockGetEmployeeObject
    });

    expect(mockRouter.push).toHaveBeenCalledWith(ROUTES.PEOPLE.DIRECTORY);
  });

  it("should show discard modal if activeStep > 0 and modal is not open", () => {
    handleGoBack({
      activeStep: 1,
      isDiscardChangesModal: {
        isModalOpen: false,
        modalType: null,
        modalOpenedFrom: ""
      },
      setIsDiscardChangesModal: mockSetIsDiscardChangesModal,
      router: mockRouter,
      getEmployeeObject: mockGetEmployeeObject
    });

    expect(mockSetIsDiscardChangesModal).toHaveBeenCalledWith({
      isModalOpen: true,
      modalType: DiscardTypeEnums.DISCARD_FORM,
      modalOpenedFrom: ""
    });
  });

  it("should navigate to directory if activeStep is 0 and employee object is empty", async () => {
    mockGetEmployeeObject.mockReturnValue({});
    await handleGoBack({
      activeStep: 0,
      isDiscardChangesModal: {
        isModalOpen: false,
        modalType: null,
        modalOpenedFrom: ""
      },
      setIsDiscardChangesModal: mockSetIsDiscardChangesModal,
      router: mockRouter,
      getEmployeeObject: mockGetEmployeeObject
    });

    expect(mockRouter.push).toHaveBeenCalledWith(ROUTES.PEOPLE.DIRECTORY);
  });

  it("should show discard modal if activeStep is 0 and employee object is not empty", () => {
    mockGetEmployeeObject.mockReturnValue({ name: "John Doe" });
    handleGoBack({
      activeStep: 0,
      isDiscardChangesModal: {
        isModalOpen: false,
        modalType: null,
        modalOpenedFrom: ""
      },
      setIsDiscardChangesModal: mockSetIsDiscardChangesModal,
      router: mockRouter,
      getEmployeeObject: mockGetEmployeeObject
    });

    expect(mockSetIsDiscardChangesModal).toHaveBeenCalledWith({
      isModalOpen: true,
      modalType: DiscardTypeEnums.DISCARD_FORM,
      modalOpenedFrom: ""
    });
  });
});

describe("handleError", () => {
  const mockSetToastMessage = jest.fn();
  const mockTranslateError = jest.fn();

  it("should set toast message with error details", () => {
    mockTranslateError.mockReturnValue("Error occurred");
    handleError({
      message: "Test error message",
      setToastMessage: mockSetToastMessage,
      translateError: mockTranslateError
    });

    expect(mockSetToastMessage).toHaveBeenCalledWith({
      toastType: ToastType.ERROR,
      title: "Error occurred",
      open: true,
      description: "Test error message"
    });
  });
});

describe("handleAddNewResourceSuccess", () => {
  const mockSetToastMessage = jest.fn();
  const mockResetEmployeeData = jest.fn();
  const mockRouter = { push: jest.fn() } as any;
  const mockTranslateText = jest.fn();

  it("should set success toast message and navigate to directory", () => {
    mockTranslateText.mockReturnValue("Resource added successfully");
    handleAddNewResourceSuccess({
      setToastMessage: mockSetToastMessage,
      resetEmployeeData: mockResetEmployeeData,
      router: mockRouter,
      translateText: mockTranslateText
    });

    expect(mockSetToastMessage).toHaveBeenCalledWith({
      toastType: ToastType.SUCCESS,
      title: "Resource added successfully",
      open: true
    });
    expect(mockResetEmployeeData).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith(ROUTES.PEOPLE.DIRECTORY);
  });
});
