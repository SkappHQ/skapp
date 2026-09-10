import { useEffect } from "react";

/**
 * Runs a callback once a query has actually failed.
 *
 * React Query v5 dropped the onError option from useQuery, so query hooks that
 * want to surface a failure expose this instead. The isFetching guard keeps a
 * cached error from firing again on remount while the retry is still in flight.
 */
export const useOnQueryError = (
  isError: boolean,
  isFetching: boolean,
  onError?: () => void
): void => {
  useEffect(() => {
    if (isError && !isFetching) {
      onError?.();
    }
  }, [isError, isFetching]);
};
