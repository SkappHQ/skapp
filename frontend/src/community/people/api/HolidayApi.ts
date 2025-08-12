import {
  UseInfiniteQueryResult,
  UseQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { rejects } from "assert";
import { AxiosResponse } from "axios";

import { ErrorResponse } from "~community/common/types/CommonTypes";
import authFetch from "~community/common/utils/axiosInterceptor";
import { holidayEndpoints } from "~community/people/api/utils/ApiEndpoints";
import { holidayQueryKeys } from "~community/people/api/utils/QueryKeys";
import {
  BulkHolidayUploadParams,
  Holiday,
  HolidayDataResponse,
  holidayBulkUploadResponse,
  holidayIndividualAddParams
} from "~community/people/types/HolidayTypes";

export const useGetAllHolidays = (
  year?: string,
  isExport?: boolean,
  sortOrder?: string
): UseQueryResult<Holiday[]> => {
  return useQuery({
    queryKey: [holidayQueryKeys.ALL_HOLIDAYS, year, sortOrder, isExport],
    queryFn: () =>
      authFetch.get(holidayEndpoints.HOLIDAY, {
        params: {
          year: year,
          sortOrder: sortOrder,
          isExport: isExport
        }
      }),
    select: (data) => data?.data?.results[0].items
  });
};

export const useGetAllHolidaysInfinite = (
  year?: string | undefined,
  sortOrder?: string | undefined
): UseInfiniteQueryResult<HolidayDataResponse> => {
  const params = {
    year: year,
    sortOrder: sortOrder,
    isExport: false
  };

  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: holidayQueryKeys.ALL_HOLIDAYS(params),
    queryFn: async ({ pageParam = 0 }) => {
      const url = holidayEndpoints.HOLIDAY;
      const holidayData = await authFetch.get(url, {
        params: {
          page: pageParam,
          ...params
        }
      });
      return holidayData?.data?.results[0];
    },
    getPreviousPageParam: (firstPage) => {
      if (firstPage?.currentPage && firstPage?.currentPage > 0) {
        return firstPage?.currentPage - 1;
      }
      return undefined;
    },
    getNextPageParam: (lastPage) => {
      if (
        lastPage?.currentPage !== undefined &&
        lastPage?.totalPages !== undefined &&
        lastPage?.currentPage < lastPage?.totalPages - 1
      ) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    }
  });
};
const holidayBulkUpload = async ({
  holidayData,
  selectedYear
}: BulkHolidayUploadParams) => {
  const params = {
    year: selectedYear,
    holidayDtoList: holidayData?.map((holiday) => ({
      date: holiday.date,
      name: holiday.name,
      holidayDuration: holiday.holidayDuration
    }))
  };

  return authFetch.post(holidayEndpoints.ADD_HOLIDAY_BULK, params);
};
export const useAddBulkHolidays = (
  onSuccess: (response: holidayBulkUploadResponse) => void,
  onError: () => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: holidayBulkUpload,
    onSuccess: (response) => {
      onSuccess(response?.data?.results?.[0]);
      queryClient
        .invalidateQueries({ queryKey: holidayQueryKeys.ADD_BULK_CALENDAR })
        .catch(rejects);
    },
    onError: () => {
      onError();
    },
    onSettled: async () => {
      await queryClient.invalidateQueries();
    }
  });
};

export const useAddIndividualHoliday = (
  onSuccess: (response: holidayBulkUploadResponse) => void,
  onError: () => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ holidayData, selectedYear }: holidayIndividualAddParams) => {
      const params = {
        year: selectedYear,
        holidayDtoList: [
          {
            date: holidayData.date,
            name: holidayData.name,
            holidayDuration: holidayData.holidayDuration,
            holidayColor: holidayData.holidayColor
          }
        ]
      };

      return authFetch.post(holidayEndpoints.ADD_INDIVIDUAL_HOLIDAY, params);
    },
    onSuccess: (response) => {
      onSuccess(response?.data?.results?.[0]);
      queryClient
        .invalidateQueries({
          queryKey: holidayQueryKeys.ADD_INDIVIDUAL_HOLIDAY
        })
        .catch(rejects);
      queryClient
        .invalidateQueries({
          queryKey: holidayQueryKeys.ALL_HOLIDAYS()
        })
        .catch(rejects);
    },
    onError: () => {
      onError();
    }
  });
};
const deleteSelectHolidayRequest = async (
  selectedDeleteIds: number[]
): Promise<AxiosResponse> => {
  const url = holidayEndpoints.DELETE_SELECTED_HOLIDAYS;
  const body = { holidayIds: selectedDeleteIds };
  const response = await authFetch.delete(url, {
    data: body
  });
  return response;
};

export const useDeleteSelectedHolidays = (
  onSuccessSelected: () => void,
  onError: (error: string) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSelectHolidayRequest,
    onSuccess: () => {
      onSuccessSelected();
      queryClient
        .invalidateQueries({
          queryKey: holidayQueryKeys.DELETE_SELECTED_HOLIDAYS
        })
        .catch(rejects);
      queryClient
        .invalidateQueries({
          queryKey: holidayQueryKeys.ALL_HOLIDAYS()
        })
        .catch(rejects);
    },
    onError: (error: ErrorResponse) => {
      onError(error?.response?.data?.results[0]?.message || "");
    }
  });
};

export const useDeleteAllHolidays = (
  onSuccessAll: () => void,
  onError: (error: string) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (selectedYear: string) =>
      authFetch.delete(
        holidayEndpoints.DELETE_ALL_HOLIDAYS(parseInt(selectedYear))
      ),
    onSuccess: () => {
      onSuccessAll();
      queryClient
        .invalidateQueries({ queryKey: holidayQueryKeys.DELETE_ALL_HOLIDAYS })
        .catch(rejects);
      queryClient
        .invalidateQueries({
          queryKey: holidayQueryKeys.ALL_HOLIDAYS()
        })
        .catch(rejects);
    },
    onError: (error: ErrorResponse) => {
      onError(error?.response?.data?.results[0]?.message || "");
    }
  });
};

export const useGetHolidayByDate = (date: string) => {
  return useQuery({
    queryKey: [holidayQueryKeys.GET_HOLIDAY_BY_DATE, date],
    queryFn: () =>
      authFetch.get(`$${holidayEndpoints.GET_HOLIDAY_BY_DATE}?date=${date}`)
  });
};
