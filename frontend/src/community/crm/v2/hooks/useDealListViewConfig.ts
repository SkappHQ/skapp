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
  config: CrmDealListViewConfig | null;
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

  const [config, setConfig] = useState<CrmDealListViewConfig | null>(null);

  useEffect(() => {
    if (fetchedConfig) setConfig(fetchedConfig);
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
    setConfig(next);
    persistConfig(next);
  };

  const handleColumnReorder = (columns: ReadonlyArray<ColumnState>) => {
    if (!config) return;
    const nextFields = applyColumnOrder(config.fields, columns);
    if (nextFields) applyConfig({ ...config, fields: nextFields });
  };

  const handleColumnVisibilityChange = (
    columns: ReadonlyArray<ColumnState>
  ) => {
    if (!config) return;
    applyConfig({
      ...config,
      fields: applyColumnVisibility(config.fields, columns)
    });
  };

  const handleSortChange = (sort: CrmDealSortConfig | null) => {
    if (!config) return;
    applyConfig({ ...config, sort });
  };

  const handleColumnResize = (columnId: string, width: number) => {
    if (!config) return;
    const nextFields = applyColumnWidth(config.fields, columnId, width);
    if (!nextFields) return;
    applyConfig({ ...config, fields: nextFields });
  };

  return {
    config,
    isConfigLoading: isLoading,
    handleColumnReorder,
    handleColumnVisibilityChange,
    handleSortChange,
    handleColumnResize
  };
};
