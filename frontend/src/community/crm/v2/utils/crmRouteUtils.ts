import ROUTES from "~community/common/constants/routes";

const CRM_ROUTE_SEGMENT = ROUTES.CRM.BASE.replace("/", "");

export const isCrmRoute = (url: string): boolean =>
  url.split("?")[0].split("/").includes(CRM_ROUTE_SEGMENT);
