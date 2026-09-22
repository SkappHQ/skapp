import { ColorOption } from "@rootcodelabs/skapp-ui";

import { CrmDealStageColorsEnum } from "~community/crm/v2/enums/common";

export const STAGE_COLOR_MAP: Record<CrmDealStageColorsEnum, string> = {
  SKY: "#60a5fa",
  PINK: "#ea5da3",
  APRICOT: "#ff9f40",
  SUNSHINE: "#fde047",
  TEAL: "#14b8a6",
  LAVENDER: "#de7cff",
  GOLD: "#eab308",
  CORAL: "#ff3e3e",
  SLATE: "#83a0a0",
  LIME: "#84cc16",
  ROSEWOOD: "#b55253",
  INDIGO: "#9366fd"
};

export const DEAL_STAGE_COLORS: ColorOption[] = Object.entries(
  STAGE_COLOR_MAP
).map(([key, color]) => ({
  id: key,
  name: key,
  value: key,
  color
}));
