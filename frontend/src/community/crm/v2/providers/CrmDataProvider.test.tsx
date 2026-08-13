import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import { useRouter } from "next/router";

import { useGetBoardInitData } from "~community/crm/api/BoardApi";
import {
  CrmDealStageColorsEnum,
  CrmDealStageEnum
} from "~community/crm/v2/enums/common";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmBoardInitDataResponse } from "~community/crm/v2/types/CrmTypes";
import { CrmStore } from "~community/crm/v2/types/StoreTypes";

import { CrmDataProvider } from "./CrmDataProvider";

jest.mock("next/router", () => ({
  useRouter: jest.fn()
}));

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (suffixes: string[]) => suffixes.join(".")
}));

jest.mock("~community/crm/api/BoardApi", () => ({
  useGetBoardInitData: jest.fn()
}));

const initData: CrmBoardInitDataResponse = {
  stages: [
    {
      id: 1,
      name: "New",
      description: null,
      color: CrmDealStageColorsEnum.SKY,
      orderIndex: 0,
      stageType: CrmDealStageEnum.INITIAL
    }
  ],
  owners: [{ employeeId: 7, firstName: "Jane", lastName: null, authPic: null }],
  contacts: [{ id: 3, name: "John Smith", companyId: 9 }]
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

const routerResult = (asPath: string): ReturnType<typeof useRouter> =>
  ({ asPath }) as ReturnType<typeof useRouter>;

describe("CrmDataProvider", () => {
  const initialStoreState: CrmStore = useCrmStoreV2.getState();

  beforeEach(() => {
    jest.clearAllMocks();

    useCrmStoreV2.setState(initialStoreState, true);
    jest.mocked(useRouter).mockReturnValue(routerResult("/crm/deals"));
    mockUseGetBoardInitData.mockReturnValue(initDataQueryResult({}));
  });

  it("enables the init-data query only when the current route is a CRM route", () => {
    render(<CrmDataProvider>child</CrmDataProvider>);

    expect(useGetBoardInitData).toHaveBeenCalledWith(true);
  });

  it("disables the init-data query outside CRM routes", () => {
    jest.mocked(useRouter).mockReturnValue(routerResult("/people"));

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
          description: null,
          color: CrmDealStageColorsEnum.SKY,
          orderIndex: 0,
          stageType: CrmDealStageEnum.INITIAL
        }
      });
    });

    const state = useCrmStoreV2.getState();
    expect(state.owners).toEqual({
      7: { employeeId: 7, firstName: "Jane", lastName: null, authPic: null }
    });
    expect(state.contacts).toEqual({
      3: { id: 3, name: "John Smith", companyId: 9 }
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
