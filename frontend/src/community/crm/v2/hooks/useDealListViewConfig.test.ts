import "@testing-library/jest-dom/extend-expect";
import { act, renderHook } from "@testing-library/react";

import {
  useGetDealListViewConfig,
  useUpdateDealListViewConfig
} from "~community/crm/v2/api/DealApi";
import {
  CrmDealColumnFieldEnum,
  CrmDealFieldConfig,
  CrmDealListViewConfig
} from "~community/crm/v2/types/CrmListViewConfigTypes";

import { useDealListViewConfig } from "./useDealListViewConfig";

const mockPersistConfig = jest.fn();

jest.mock("~community/crm/v2/api/DealApi", () => ({
  useGetDealListViewConfig: jest.fn(),
  useUpdateDealListViewConfig: jest.fn()
}));

const field = (
  name: CrmDealColumnFieldEnum,
  overrides: Partial<CrmDealFieldConfig> = {}
): CrmDealFieldConfig => ({
  field: name,
  width: 100,
  isVisible: true,
  isHideable: true,
  isSortable: true,
  isDraggable: true,
  isGroupable: false,
  isResizable: true,
  ...overrides
});

const fetchedConfig: CrmDealListViewConfig = {
  fields: [
    field(CrmDealColumnFieldEnum.DEAL_NAME, { isHideable: false }),
    field(CrmDealColumnFieldEnum.VALUE),
    field(CrmDealColumnFieldEnum.STAGE)
  ],
  sort: null
};

const renderConfigHook = () => renderHook(() => useDealListViewConfig(true));

describe("useDealListViewConfig", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (useGetDealListViewConfig as jest.Mock).mockReturnValue({
      data: fetchedConfig,
      isLoading: false
    });
    (useUpdateDealListViewConfig as jest.Mock).mockReturnValue({
      mutate: mockPersistConfig
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("adopts the fetched config", () => {
    const { result } = renderConfigHook();
    expect(result.current.config).toEqual(fetchedConfig);
  });

  it("persists a column reorder immediately", () => {
    const { result } = renderConfigHook();

    act(() => {
      result.current.handleColumnReorder([
        { id: CrmDealColumnFieldEnum.STAGE, visible: true },
        { id: CrmDealColumnFieldEnum.DEAL_NAME, visible: true },
        { id: CrmDealColumnFieldEnum.VALUE, visible: true }
      ]);
    });

    expect(mockPersistConfig).toHaveBeenCalledTimes(1);
    expect(
      mockPersistConfig.mock.calls[0][0].fields.map(
        (item: CrmDealFieldConfig) => item.field
      )
    ).toEqual([
      CrmDealColumnFieldEnum.STAGE,
      CrmDealColumnFieldEnum.DEAL_NAME,
      CrmDealColumnFieldEnum.VALUE
    ]);
  });

  it("keeps a non-hideable column visible when the table hides it", () => {
    const { result } = renderConfigHook();

    act(() => {
      result.current.handleColumnVisibilityChange([
        { id: CrmDealColumnFieldEnum.DEAL_NAME, visible: false },
        { id: CrmDealColumnFieldEnum.VALUE, visible: false }
      ]);
    });

    const persisted = mockPersistConfig.mock.calls[0][0];
    expect(persisted.fields[0].isVisible).toBe(true);
    expect(persisted.fields[1].isVisible).toBe(false);
  });

  it("debounces a resize and persists the final width once", () => {
    const { result } = renderConfigHook();

    act(() => {
      result.current.handleColumnResize(CrmDealColumnFieldEnum.VALUE, 200);
      result.current.handleColumnResize(CrmDealColumnFieldEnum.VALUE, 260);
    });
    expect(mockPersistConfig).not.toHaveBeenCalled();

    act(() => {
      jest.runAllTimers();
    });
    expect(mockPersistConfig).toHaveBeenCalledTimes(1);
    expect(mockPersistConfig.mock.calls[0][0].fields[1].width).toBe(260);
  });

  it("ignores a resize for a column that is not in the config", () => {
    const { result } = renderConfigHook();

    act(() => {
      result.current.handleColumnResize("UNKNOWN", 200);
      jest.runAllTimers();
    });

    expect(mockPersistConfig).not.toHaveBeenCalled();
  });

  it("does not persist a pending resize after unmount", () => {
    const { result, unmount } = renderConfigHook();

    act(() => {
      result.current.handleColumnResize(CrmDealColumnFieldEnum.VALUE, 200);
    });
    unmount();

    act(() => {
      jest.runAllTimers();
    });
    expect(mockPersistConfig).not.toHaveBeenCalled();
  });
});
