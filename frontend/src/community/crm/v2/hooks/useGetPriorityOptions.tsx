import PriorityLabel from "~community/crm/v2/components/atoms/PriorityLabel/PriorityLabel";
import { PRIORITY_OPTIONS } from "~community/crm/v2/constants/taskConstants";
import { CrmPriorityOption } from "~community/crm/v2/types/CrmTypes";

export const useGetPriorityOptions = (): CrmPriorityOption[] =>
  PRIORITY_OPTIONS.map((option) => ({
    id: option.key,
    value: option.value,
    label: <PriorityLabel priority={option.value} showLabel />
  }));
