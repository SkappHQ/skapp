import ROUTES from "~community/common/constants/routes";

const CRM_ROUTE_SEGMENT = ROUTES.CRM.BASE.replace("/", "");

/**
 * True when the given url points at any CRM page.
 *
 * Matches on the crm path segment so both the public url (`/crm/deals`) and the
 * rewrite target it resolves to (`/community/crm/deals`) are covered.
 */
export const isCrmRoute = (url: string): boolean =>
  url.split("?")[0].split("/").includes(CRM_ROUTE_SEGMENT);
