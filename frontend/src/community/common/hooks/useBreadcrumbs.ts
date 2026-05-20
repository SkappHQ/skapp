import { BreadcrumbItem } from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/router";
import { useEffect } from "react";

import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useBreadcrumbContext } from "~community/common/providers/BreadcrumbProvider";

export type BreadcrumbSegment = [label: string, href?: string];

const buildBreadcrumbTrail = (
  segments: BreadcrumbSegment[]
): BreadcrumbItem[] =>
  segments.map(([label, href]) => (href ? { label, href } : { label }));

const useBreadcrumbs = (...segments: BreadcrumbSegment[]): BreadcrumbItem[] => {
  const { asPath } = useRouter();
  const translateText = useTranslator("breadcrumbs");
  const { breadcrumbs: contextBreadcrumbs, setBreadcrumbs } =
    useBreadcrumbContext();

  useEffect(() => {
    if (segments.length > 0) {
      setBreadcrumbs(buildBreadcrumbTrail(segments));
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
