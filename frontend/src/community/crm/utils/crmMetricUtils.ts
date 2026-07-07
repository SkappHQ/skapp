import { CrmMetricLabelThemeEnum } from "~community/crm/enums/common";

interface LabelStyles {
  backgroundColor: string;
  textColor: string;
}

export const getLabelStyles = (
  variant: CrmMetricLabelThemeEnum
): LabelStyles =>
  variant === CrmMetricLabelThemeEnum.GREEN
    ? {
        backgroundColor: "bg-semantic-green-background",
        textColor: "text-semantic-green-text"
      }
    : {
        backgroundColor: "bg-semantic-red-background",
        textColor: "text-semantic-red-text"
      };
