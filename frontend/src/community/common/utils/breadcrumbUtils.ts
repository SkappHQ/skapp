import { BreadcrumbItem } from "@rootcodelabs/skapp-ui";

/**
 * A segment tuple: [label] or [label, href]
 * - label: translation key for the breadcrumb text
 * - href: optional route path to make the segment a link
 */
export type BreadcrumbSegment = [label: string, href?: string];

export const buildBreadcrumbTrail = (
  ...segments: BreadcrumbSegment[]
): BreadcrumbItem[] =>
  segments.map(([label, href]) => (href ? { label, href } : { label }));
