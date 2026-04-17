import { BreadcrumbItem } from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/router";
import { useMemo } from "react";

import breadcrumbConfig, {
  dynamicBreadcrumbPatterns
} from "~community/common/constants/breadcrumbConfig";

const useBreadcrumbs = (): BreadcrumbItem[] => {
  const { asPath } = useRouter();

  const breadcrumbs = useMemo(() => {
    // Strip query params and hash from the path
    const cleanPath = asPath.split("?")[0].split("#")[0];

    // 1. Try exact match from static config
    if (breadcrumbConfig[cleanPath]) {
      return breadcrumbConfig[cleanPath];
    }

    // 2. Try dynamic patterns
    for (const { pattern, getBreadcrumbs } of dynamicBreadcrumbPatterns) {
      const matches = cleanPath.match(pattern);
      if (matches) {
        return getBreadcrumbs(matches);
      }
    }

    // 3. Fallback: no breadcrumbs
    return [];
  }, [asPath]);

  return breadcrumbs;
};

export default useBreadcrumbs;
