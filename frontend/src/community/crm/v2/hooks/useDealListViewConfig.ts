import { useEffect, useRef, useState } from "react";

import {
  useGetDealListViewConfig,
  useUpdateDealListViewConfig
} from "~community/crm/v2/api/DealApi";
import {
  CrmDealListViewConfig,
  CrmDealSortConfig
} from "~community/crm/v2/types/CrmListViewConfigTypes";
import {
  applyColumnVisibility,
  applyColumnWidth,
  reorderConfigFields
} from "~community/crm/v2/utils/dealListViewUtil";

interface ColumnState {
  id: string;
  visible: boolean;
}

const useDealListViewConfig = (enabled: boolean) => {
  const { data: fetchedConfig, isLoading } = useGetDealListViewConfig(enabled);
  const { mutate: persistConfig } = useUpdateDealListViewConfig();

  const [config, setConfig] = useState<CrmDealListViewConfig | null>(null);
  const persistTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (fetchedConfig) setConfig(fetchedConfig);
  }, [fetchedConfig]);

  const applyConfig = (next: CrmDealListViewConfig) => {
    setConfig(next);
    persistConfig(next);
  };

  const persistDebounced = (next: CrmDealListViewConfig) => {
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => persistConfig(next), 500);
  };

  const handleColumnReorder = (columns: ReadonlyArray<ColumnState>) => {
    if (!config) return;
    const nextFields = reorderConfigFields(config.fields, columns);
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
    const next = {
      ...config,
      fields: applyColumnWidth(config.fields, columnId, width)
    };
    setConfig(next);
    persistDebounced(next);
  };

  return {
    config,
    isConfigLoading: isLoading,
    applyConfig,
    handleColumnReorder,
    handleColumnVisibilityChange,
    handleSortChange,
    handleColumnResize
  };
};

export default useDealListViewConfig;
