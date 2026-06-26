import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { APPLICATION_VERSION_INFO_URL } from "../utils/getConstants";
import { applicationVersionEndpoints } from "./utils/ApiEndpoints";
import { applicationVersionInfoQueryKeys } from "./utils/QueryKeys";

const authFetch = axios.create({
  baseURL: APPLICATION_VERSION_INFO_URL
});
export const useGetApplicationVersionDetails = (language: string) => {
  return useQuery({
    queryKey: [
      applicationVersionInfoQueryKeys.GET_APPLICATION_VERSION_INFO(language)
    ],
    queryFn: async () => {
      const { data } = await authFetch.get(
        applicationVersionEndpoints.GET_APPLICATION_VERSION_UPDATES(language)
      );
      return data;
    }
  });
};
