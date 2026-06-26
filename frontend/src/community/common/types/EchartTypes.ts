import { type TooltipComponentOption } from "echarts/components";

type Unified<T> = Exclude<T, T[]>;
export type TooltipFormatterCallback = Exclude<
  NonNullable<TooltipComponentOption["formatter"]>,
  string
>;
export type TooltipFormatterParams = Parameters<TooltipFormatterCallback>[0];
export type SingleTooltipFormatterParams = Unified<TooltipFormatterParams>;
export type MultipleTooltipFormatterParams = SingleTooltipFormatterParams[];
