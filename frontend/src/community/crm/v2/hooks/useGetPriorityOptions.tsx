import { useTranslator } from "~community/common/hooks/useTranslator";
import PriorityLabel from "~community/crm/v2/components/molecules/PriorityLabel/PriorityLabel";
import { PRIORITY_OPTIONS } from "~community/crm/v2/constants/taskConstants";
import { CrmPriorityOption } from "~community/crm/v2/types/CrmTypes";

export const useGetPriorityOptions = (): CrmPriorityOption[] => {
  const translateText = useTranslator("crmModule", "common", "priorityOptions");

  return PRIORITY_OPTIONS.map((option) => ({
    id: option.key,
    value: option.value,
    label: (
      <PriorityLabel
        priority={option.value}
        label={translateText([option.key])}
      />
    )
  }));
};
