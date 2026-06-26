import { useMediaQuery as muiUseMediaQuery } from "@mui/material";

export enum MediaQueries {
  BELOW_600 = "(max-width: 600px)",
  BELOW_900 = "(max-width: 900px)",
  BELOW_1024 = "(max-width: 1024px)",
  BELOW_1440 = "(max-width: 1440px)"
}

export const useMediaQuery = () => {
  const queryMatches = (query: string | number) => {
    if (typeof query === "string") {
      return muiUseMediaQuery(query);
    } else {
      return muiUseMediaQuery(`(max-width: ${query}px)`);
    }
  };

  return queryMatches;
};
