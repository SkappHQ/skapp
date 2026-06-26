import { rejects } from "assert";
import { type NextRouter } from "next/router";

export const setQueryParam = (
  router: NextRouter,
  params?: Record<string, string>
) => {
  const query = { ...params };

  router
    .push(
      {
        pathname: router.pathname,
        query
      },
      undefined,
      { shallow: true }
    )
    .catch(rejects);
};
