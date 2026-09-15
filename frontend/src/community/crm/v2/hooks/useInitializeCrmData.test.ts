import "@testing-library/jest-dom";
import { renderHook, waitFor } from "@testing-library/react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useGetBoardInitData } from "~community/crm/v2/api/BoardApi";
import {
  CrmDealStageColorsEnum,
  CrmDealStageEnum
} from "~community/crm/v2/enums/common";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmBoardInitDataResponse } from "~community/crm/v2/types/CrmTypes";
import { CrmStore } from "~community/crm/v2/types/StoreTypes";
import { toStagesRecord } from "~community/crm/v2/utils/commonUtil";

import { useInitializeCrmData } from "./useInitializeCrmData";

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (suffixes: string[]) => suffixes.join(".")
}));

const mockSetToastMessage = jest.fn();

jest.mock("~community/common/providers/ToastProvider", () => ({
  useToast: () => ({ setToastMessage: mockSetToastMessage })
}));

jest.mock("~community/crm/v2/api/BoardApi", () => ({
  useGetBoardInitData: jest.fn()
}));

const initData: CrmBoardInitDataResponse = {
  stages: [
    {
      id: 1,
      name: "New",
      color: CrmDealStageColorsEnum.SKY,
      orderIndex: 0,
      stageType: CrmDealStageEnum.INITIAL
    }
  ],
  owners: [{ employeeId: 7, firstName: "Jane", lastName: "Doe" }],
  contacts: [{ id: 3, firstName: "John", lastName: "Smith", companyId: 9 }],
  taskTypes: [
    { id: 5, name: "CALL", orderIndex: 1 },
    { id: 4, name: "EMAIL", orderIndex: 0 }
  ]
};

interface InitDataQueryStub {
  data?: CrmBoardInitDataResponse;
  isLoading?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
}

const mockUseGetBoardInitData = useGetBoardInitData as unknown as jest.Mock;

const initDataQueryResult = (overrides: InitDataQueryStub) => ({
  data: undefined,
  isLoading: false,
  isError: false,
  isSuccess: false,
  ...overrides
});

describe("useInitializeCrmData", () => {
  const initialStoreState: CrmStore = useCrmStoreV2.getState();

  beforeEach(() => {
    jest.clearAllMocks();

    useCrmStoreV2.setState(initialStoreState, true);
    mockUseGetBoardInitData.mockReturnValue(initDataQueryResult({}));
  });

  it("enables the init-data query until CRM data has initialized", () => {
    renderHook(() => useInitializeCrmData());

    expect(useGetBoardInitData).toHaveBeenCalledWith(true);
  });

  it("leaves the query disabled once CRM data has initialized", () => {
    useCrmStoreV2.getState().setIsCrmDataInitialized(true);

    renderHook(() => useInitializeCrmData());

    expect(useGetBoardInitData).toHaveBeenCalledWith(false);
  });

  it("still fetches when another writer has already populated stages", () => {
    useCrmStoreV2.getState().setStages(toStagesRecord(initData.stages));

    renderHook(() => useInitializeCrmData());

    expect(useGetBoardInitData).toHaveBeenCalledWith(true);
  });

  it("returns the query's loading state for the page to render its skeleton", () => {
    mockUseGetBoardInitData.mockReturnValue(
      initDataQueryResult({ isLoading: true })
    );

    const { result } = renderHook(() => useInitializeCrmData());

    expect(result.current.isCrmInitialDataLoading).toBe(true);
  });

  it("normalizes a successful response into the store", async () => {
    mockUseGetBoardInitData.mockReturnValue(
      initDataQueryResult({ data: initData, isSuccess: true })
    );

    renderHook(() => useInitializeCrmData());

    await waitFor(() => {
      expect(useCrmStoreV2.getState().stages).toEqual({
        1: {
          id: 1,
          name: "New",
          color: CrmDealStageColorsEnum.SKY,
          orderIndex: 0,
          stageType: CrmDealStageEnum.INITIAL
        }
      });
    });

    const state = useCrmStoreV2.getState();
    expect(state.owners).toEqual({
      7: { employeeId: 7, firstName: "Jane", lastName: "Doe" }
    });
    expect(state.contacts).toEqual({
      3: { id: 3, firstName: "John", lastName: "Smith", companyId: 9 }
    });
    expect(state.taskTypes).toEqual({
      4: { id: 4, name: "EMAIL", orderIndex: 0 },
      5: { id: 5, name: "CALL", orderIndex: 1 }
    });
    expect(state.isCrmDataInitialized).toBe(true);
    expect(mockSetToastMessage).not.toHaveBeenCalled();
  });

  it("raises an error toast and leaves the entity records untouched when the query fails", () => {
    mockUseGetBoardInitData.mockReturnValue(
      initDataQueryResult({ isError: true })
    );

    renderHook(() => useInitializeCrmData());

    expect(mockSetToastMessage).toHaveBeenCalledWith({
      open: true,
      toastType: ToastType.ERROR,
      title: "errorTitle",
      description: "errorDescription"
    });

    const state = useCrmStoreV2.getState();
    expect(state.stages).toEqual({});
    expect(state.contacts).toEqual({});
    expect(state.isCrmDataInitialized).toBe(false);
  });
});
