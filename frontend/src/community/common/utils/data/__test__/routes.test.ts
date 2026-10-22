import ROUTES from "~community/common/constants/routes";
import routes from "~community/common/utils/data/routes";

const collectIds = (items: { id: string; subTree?: { id: string }[] }[]) =>
  items.flatMap((item) => [
    item.id,
    ...(item.subTree ?? []).map((subRoute) => subRoute.id)
  ]);

describe("drawer routes data", () => {
  const crmRoute = routes.find((route) => route.name === "CRM");

  it("lists Activities directly below Tasks in the CRM group", () => {
    const names = crmRoute?.subTree?.map((subRoute) => subRoute.name) ?? [];

    expect(names.slice(-2)).toEqual(["Tasks", "Activities"]);
  });

  it("points Tasks and Activities to their own pages", () => {
    const tasks = crmRoute?.subTree?.find((route) => route.name === "Tasks");
    const activities = crmRoute?.subTree?.find(
      (route) => route.name === "Activities"
    );

    expect(tasks).toMatchObject({ id: "4D", url: ROUTES.CRM.TASKS });
    expect(activities).toMatchObject({ id: "4E", url: ROUTES.CRM.ACTIVITIES });
  });

  it("keeps every route id unique", () => {
    const ids = collectIds(routes);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
