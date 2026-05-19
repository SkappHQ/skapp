import { BreadcrumbItem } from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/router";

import breadcrumbConfig, {
  dynamicBreadcrumbPatterns
} from "~community/common/constants/breadcrumbConfig";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";

const HIDDEN_BREADCRUMB_ROUTES = [
  ROUTES.DASHBOARD.BASE,
  ROUTES.CONFIGURATIONS.BASE,
  ROUTES.SETTINGS.BASE,
  ROUTES.NOTIFICATIONS
];

const useBreadcrumbs = (): BreadcrumbItem[] => {
  const { asPath } = useRouter();
  const translateText = useTranslator("breadcrumbs");

  // Strip query params and hash from the path
  const cleanPath = asPath.split("?")[0].split("#")[0];

  // Don't show breadcrumbs on certain base pages
  if (HIDDEN_BREADCRUMB_ROUTES.includes(cleanPath)) {
    return [];
  }

  let items: BreadcrumbItem[] = [];

  // 1. Try exact match from static config
  if (breadcrumbConfig[cleanPath]) {
    items = breadcrumbConfig[cleanPath];
  } else {
    // 2. Try dynamic patterns
    for (const { pattern, getBreadcrumbs } of dynamicBreadcrumbPatterns) {
      const matches = cleanPath.match(pattern);
      if (matches) {
        items = getBreadcrumbs(matches);
        break;
      }
    }
  }

  // Translate labels
  return items.map((item) => ({
    ...item,
    label: translateText([item.label])
  }));
};

export default useBreadcrumbs;
