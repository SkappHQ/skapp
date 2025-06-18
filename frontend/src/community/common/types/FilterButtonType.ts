import { type ReactNode } from "react";

import { PopperAndTooltipPositionTypes } from "./MoleculeTypes";

export type FilterButtonTransformedFilterItemTypes = {
  id: string;
  title: string;
  isAllFiltersSelected?: boolean;
  filters: {
    label: string;
    id: number;
    selected: boolean;
  }[];
};

export type FilterButtonFilterItemTypes = {
  title: string;
  filters: string[];
};

export type SelectedFilters = {
  filter: string[];
  handleFilterDelete: (filter: string) => void;
};

export type FilterButtonTypes = {
  id: string;
  position: PopperAndTooltipPositionTypes;
  handleApplyBtnClick: () => void;
  handleResetBtnClick: () => void;
  children: ReactNode;
  selectedFilters: SelectedFilters[];
  isResetBtnDisabled: boolean;
  isAllFilterShown?: boolean;
  title?: string;
  accessibility?: {
    ariaLabel: string;
  };
};
