
import { CrmMetricChipThemeEnum } from "~community/crm/enums/common";


export const getChipStyles = (theme: CrmMetricChipThemeEnum) => {
  switch (theme) {
    case CrmMetricChipThemeEnum.SUCCESS:
      return "bg-[#ECFCCA] text-[var(--color-semantic-green-text)]";
    case CrmMetricChipThemeEnum.ERROR:
      return "bg-[var(--color-semantic-red-background)] text-[var(--color-semantic-red-text)]";
    default:
      return "bg-[#ECFCCA] text-[var(--color-semantic-green-text)]";
  }
};


