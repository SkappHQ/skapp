import { useEffect, useRef, useState } from "react";

import {
  useGetDealListViewConfig,
  useUpdateDealListViewConfig
} from "~community/crm/v2/api/DealApi";
import {
  CrmDealColumnFieldEnum,
  CrmDealFieldConfig,
  CrmDealListViewConfig,
  CrmDealSortConfig
} from "~community/crm/v2/types/CrmListViewConfigTypes";

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
    const byField = new Map<CrmDealColumnFieldEnum, CrmDealFieldConfig>(
      config.fields.map((field) => [field.field, field])
    );
    const nextFields = columns
      .map((column) => byField.get(column.id as CrmDealColumnFieldEnum))
      .filter((field): field is CrmDealFieldConfig => Boolean(field));
    if (nextFields.length !== config.fields.length) return;
    applyConfig({ ...config, fields: nextFields });
  };

  const handleColumnVisibilityChange = (
    columns: ReadonlyArray<ColumnState>
  ) => {
    if (!config) return;
    const visibilityById = new Map(
      columns.map((column) => [column.id, column.visible])
    );
    const nextFields = config.fields.map((field) => ({
      ...field,
      isVisible: field.isHideable
        ? visibilityById.get(field.field) ?? field.isVisible
        : true
    }));
    applyConfig({ ...config, fields: nextFields });
  };

  const handleSortChange = (sort: CrmDealSortConfig | null) => {
    if (!config) return;
    applyConfig({ ...config, sort });
  };

  const handleColumnResize = (columnId: string, width: number) => {
    if (!config) return;
    const nextFields = config.fields.map((field) =>
      field.field === columnId ? { ...field, width } : field
    );
    const next = { ...config, fields: nextFields };
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
