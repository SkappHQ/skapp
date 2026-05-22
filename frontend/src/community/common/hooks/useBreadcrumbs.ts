import { BreadcrumbItem } from "@rootcodelabs/skapp-ui";
import { useEffect } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useBreadcrumbContext } from "~community/common/providers/BreadcrumbProvider";

export interface BreadcrumbSegment {
  label: string;
  href?: string;
}

const useBreadcrumbs = (segments: BreadcrumbSegment[]): BreadcrumbItem[] => {
  const translateText = useTranslator("breadcrumbs");
  const { breadcrumbs: contextBreadcrumbs, setBreadcrumbs } =
    useBreadcrumbContext();

  useEffect(() => {
    if (segments.length > 0) {
      setBreadcrumbs(segments);
    }

    return () => {
      if (segments.length > 0) {
        setBreadcrumbs([]);
      }
    };
  }, [JSON.stringify(segments), setBreadcrumbs]);

  // Translate labels and return for rendering
  return contextBreadcrumbs.map((item) => ({
    ...item,
    label: translateText([item.label])
  }));
};

export default useBreadcrumbs;
