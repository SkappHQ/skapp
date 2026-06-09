import { CrmMetricLabelThemeEnum } from "~community/crm/enums/common";

export const getLabelStyles = (
  theme: CrmMetricLabelThemeEnum
): { backgroundColor: string; textColor: string } => {
  switch (theme) {
    case CrmMetricLabelThemeEnum.GREEN:
      return {
        backgroundColor: "bg-semantic-green-background",
        textColor: "text-semantic-green-text"
      };
    case CrmMetricLabelThemeEnum.RED:
      return {
        backgroundColor: "bg-semantic-red-background",
        textColor: "text-semantic-red-text"
      };
  }
};
