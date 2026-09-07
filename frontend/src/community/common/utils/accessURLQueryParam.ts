import { rejects } from "assert";

import { type CompatRouter } from "~community/common/hooks/useCompatRouter";

export const setQueryParam = (
  router: CompatRouter,
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
