import { ReactNode } from "react";

import { LeaveStates, ManagerTypes } from "./CommonTypes";

export type AvatarPropTypes = {
  firstName: string | undefined;
  lastName?: string | undefined;
  image: string | null;
  primaryManager?: boolean;
  managerType?: ManagerTypes;
  leaveState?: LeaveStates;
};

export enum MenuTypes {
  SORT = "sort",
  FILTER = "filter",
  SEARCH = "search",
  SELECT = "select",
  GRAPH = "graph",
  DEFAULT = "default"
}

export type PopperAndTooltipPositionTypes =
  | "bottom-end"
  | "bottom-start"
  | "bottom"
  | "left-end"
  | "left-start"
  | "left"
  | "right-end"
  | "right-start"
  | "right"
  | "top-end"
  | "top-start"
  | "top";

export type MenuItemTypes = {
  id: string | number;
  icon?: ReactNode;
  text: string;
  color?: string;
  onClickHandler: () => void;
  isDisabled?: boolean;
  ariaLabel?: string;
};

export enum IconPositions {
  START = "start",
  END = "end"
}

export type DurationSelectorDisabledOptions = {
  fullDay?: boolean;
  halfDayMorning?: boolean;
  halfDayEvening?: boolean;
};
