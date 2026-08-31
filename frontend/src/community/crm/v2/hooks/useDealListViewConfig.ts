import { useCallback, useEffect, useRef, useState } from "react";

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

/** Minimal shape read from the ListTable column callbacks. */
interface ColumnState {
  id: string;
  visible: boolean;
}

/**
 * Loads the current user's deal list-view config and exposes handlers that mutate it
 * optimistically and persist the whole blob back to the backend. Column order/visibility
 * are display-only; the backend just stores what it receives.
 */
const useDealListViewConfig = (enabled: boolean) => {
  const { data: fetchedConfig, isLoading } = useGetDealListViewConfig(enabled);
  const { mutate: persistConfig } = useUpdateDealListViewConfig();

  const [config, setConfig] = useState<CrmDealListViewConfig | null>(null);

  useEffect(() => {
    if (fetchedConfig) setConfig(fetchedConfig);
  }, [fetchedConfig]);

  const applyConfig = useCallback(
    (next: CrmDealListViewConfig) => {
      setConfig(next);
      persistConfig(next);
    },
    [persistConfig]
  );

  // Resize fires continuously while dragging the column border, so persist is debounced
  // while the local state updates immediately for a smooth resize.
  const persistTimer = useRef<ReturnType<typeof setTimeout>>();
  const persistDebounced = useCallback(
    (next: CrmDealListViewConfig) => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
      persistTimer.current = setTimeout(() => persistConfig(next), 500);
    },
    [persistConfig]
  );

  const handleColumnReorder = useCallback(
    (columns: ReadonlyArray<ColumnState>) => {
      if (!config) return;
      const byField = new Map<CrmDealColumnFieldEnum, CrmDealFieldConfig>(
        config.fields.map((field) => [field.field, field])
      );
      const nextFields = columns
        .map((column) => byField.get(column.id as CrmDealColumnFieldEnum))
        .filter((field): field is CrmDealFieldConfig => Boolean(field));
      if (nextFields.length !== config.fields.length) return;
      applyConfig({ ...config, fields: nextFields });
    },
    [config, applyConfig]
  );

  const handleColumnVisibilityChange = useCallback(
    (columns: ReadonlyArray<ColumnState>) => {
      if (!config) return;
      const visibilityById = new Map(
        columns.map((column) => [column.id, column.visible])
      );
      const nextFields = config.fields.map((field) => ({
        ...field,
        // Non-hideable columns (e.g. deal name) stay visible regardless of the toggle.
        isVisible: field.isHideable
          ? visibilityById.get(field.field) ?? field.isVisible
          : true
      }));
      applyConfig({ ...config, fields: nextFields });
    },
    [config, applyConfig]
  );

  const handleSortChange = useCallback(
    (sort: CrmDealSortConfig | null) => {
      if (!config) return;
      applyConfig({ ...config, sort });
    },
    [config, applyConfig]
  );

  const handleColumnResize = useCallback(
    (columnId: string, width: number) => {
      if (!config) return;
      const nextFields = config.fields.map((field) =>
        field.field === columnId ? { ...field, width } : field
      );
      const next = { ...config, fields: nextFields };
      setConfig(next);
      persistDebounced(next);
    },
    [config, persistDebounced]
  );

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
