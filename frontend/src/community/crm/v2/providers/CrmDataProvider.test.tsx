import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";

import { useGetBoardInitData } from "~community/crm/v2/api/BoardApi";
import {
  CrmDealStageColorsEnum,
  CrmDealStageEnum
} from "~community/crm/v2/enums/common";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmBoardInitDataResponse } from "~community/crm/v2/types/CrmTypes";
import { CrmStore } from "~community/crm/v2/types/StoreTypes";
import { toStagesRecord } from "~community/crm/v2/utils/crmEntityUtils";

import { CrmDataProvider } from "./CrmDataProvider";

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (suffixes: string[]) => suffixes.join(".")
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

/**
 * The board api still speaks the v1 response shape, so the query result is
 * stubbed rather than typed against it.
 */
const mockUseGetBoardInitData = useGetBoardInitData as unknown as jest.Mock;

const initDataQueryResult = (overrides: InitDataQueryStub) => ({
  data: undefined,
  isLoading: false,
  isError: false,
  isSuccess: false,
  ...overrides
});

describe("CrmDataProvider", () => {
  const initialStoreState: CrmStore = useCrmStoreV2.getState();

  beforeEach(() => {
    jest.clearAllMocks();

    useCrmStoreV2.setState(initialStoreState, true);
    mockUseGetBoardInitData.mockReturnValue(initDataQueryResult({}));
  });

  it("enables the init-data query while the store has no stages yet", () => {
    render(<CrmDataProvider>child</CrmDataProvider>);

    expect(useGetBoardInitData).toHaveBeenCalledWith(true);
  });

  it("leaves the query disabled once the session has already initialised", () => {
    useCrmStoreV2.getState().setStages(toStagesRecord(initData.stages));

    render(<CrmDataProvider>child</CrmDataProvider>);

    expect(useGetBoardInitData).toHaveBeenCalledWith(false);
  });

  it("pushes the loading flag into the store as the query's loading state changes", () => {
    mockUseGetBoardInitData.mockReturnValue(
      initDataQueryResult({ isLoading: true })
    );

    render(<CrmDataProvider>child</CrmDataProvider>);

    expect(useCrmStoreV2.getState().crmDataLoading).toBe(true);
  });

  it("normalizes a successful response into the store", async () => {
    mockUseGetBoardInitData.mockReturnValue(
      initDataQueryResult({ data: initData, isSuccess: true })
    );

    render(<CrmDataProvider>child</CrmDataProvider>);

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
    expect(state.crmDataLoading).toBe(false);
    expect(state.crmDataError).toBeNull();
  });

  it("surfaces a translated error and leaves the entity records untouched when the query fails", async () => {
    mockUseGetBoardInitData.mockReturnValue(
      initDataQueryResult({ isError: true })
    );

    render(<CrmDataProvider>child</CrmDataProvider>);

    await waitFor(() => {
      expect(useCrmStoreV2.getState().crmDataError).toBe("errorDescription");
    });

    const state = useCrmStoreV2.getState();
    expect(state.stages).toEqual({});
    expect(state.contacts).toEqual({});
  });
});
