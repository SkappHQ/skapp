import { useEffect, useState } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  useGetDealListViewConfig,
  useUpdateDealListViewConfig
} from "~community/crm/v2/api/DealApi";
import {
  ColumnState,
  CrmDealListViewConfig,
  CrmDealSortConfig
} from "~community/crm/v2/types/CrmListViewConfigTypes";
import {
  applyColumnOrder,
  applyColumnVisibility,
  applyColumnWidth
} from "~community/crm/v2/utils/dealListViewUtil";

interface UseDealListViewConfigReturn {
  columnConfig: CrmDealListViewConfig | null;
  isConfigLoading: boolean;
  handleColumnReorder: (columns: ReadonlyArray<ColumnState>) => void;
  handleColumnVisibilityChange: (columns: ReadonlyArray<ColumnState>) => void;
  handleSortChange: (sort: CrmDealSortConfig | null) => void;
  handleColumnResize: (columnId: string, width: number) => void;
}

export const useDealListViewConfig = (
  enabled: boolean
): UseDealListViewConfigReturn => {
  const translateText = useTranslator("crmModule", "common", "initData");
  const { setToastMessage } = useToast();

  const {
    data: fetchedConfig,
    isLoading,
    isError
  } = useGetDealListViewConfig(enabled);
  const { mutate: persistConfig } = useUpdateDealListViewConfig();

  const [columnConfig, setColumnConfig] =
    useState<CrmDealListViewConfig | null>(null);

  useEffect(() => {
    if (fetchedConfig) setColumnConfig(fetchedConfig);
  }, [fetchedConfig]);

  useEffect(() => {
    if (!isError) return;
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["errorTitle"]),
      description: translateText(["errorDescription"])
    });
  }, [isError]);

  const applyConfig = (next: CrmDealListViewConfig) => {
    setColumnConfig(next);
    persistConfig(next);
  };

  const handleColumnReorder = (columns: ReadonlyArray<ColumnState>) => {
    if (!columnConfig) return;
    const nextFields = applyColumnOrder(columnConfig.fields, columns);
    if (nextFields) applyConfig({ ...columnConfig, fields: nextFields });
  };

  const handleColumnVisibilityChange = (
    columns: ReadonlyArray<ColumnState>
  ) => {
    if (!columnConfig) return;
    applyConfig({
      ...columnConfig,
      fields: applyColumnVisibility(columnConfig.fields, columns)
    });
  };

  const handleSortChange = (sort: CrmDealSortConfig | null) => {
    if (!columnConfig) return;
    applyConfig({ ...columnConfig, sort });
  };

  const handleColumnResize = (columnId: string, width: number) => {
    if (!columnConfig) return;
    const nextFields = applyColumnWidth(columnConfig.fields, columnId, width);
    if (!nextFields) return;
    applyConfig({ ...columnConfig, fields: nextFields });
  };

  return {
    columnConfig,
    isConfigLoading: isLoading,
    handleColumnReorder,
    handleColumnVisibilityChange,
    handleSortChange,
    handleColumnResize
  };
};
