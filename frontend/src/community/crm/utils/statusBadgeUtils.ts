// Utility to ensure statusBadge always has a color
import type { AdvancedAccordionItem } from "~community/crm/components/atoms/AdvancedAccordion/AdvancedAccordion";

const DEFAULT_STATUS_DOT_COLOR = "#51A2FF"; // Tailwind blue-400

export function withDefaultStatusBadgeColor<T extends AdvancedAccordionItem>(item: T): T {
  if (item.statusBadge && !item.statusBadge.iconColor) {
    item.statusBadge.iconColor = DEFAULT_STATUS_DOT_COLOR;
  }
  return item;
}
