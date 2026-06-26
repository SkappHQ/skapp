import {
  type UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import { jobFamilyEndpoints } from "~community/people/api/utils/ApiEndpoints";
import { jobFamilyQueryKeys } from "~community/people/api/utils/QueryKeys";
import {
  AddJobFamilyMutationType,
  AllJobFamilyType,
  EditJobFamilyMutationType,
  TransferMembersWithJobFamilyMutationType,
  TransferMembersWithJobTitleMutationType
} from "~community/people/types/JobFamilyTypes";
import {
  sortJobFamilyArrayInAscendingOrder,
  sortJobTitlesArrayInAscendingOrder
} from "~community/people/utils/jobFamilyUtils/commonUtils";
import { quickSetupQueryKeys } from "~enterprise/common/api/utils/QueryKeys";

export const useGetAllJobFamilies = (): UseQueryResult<AllJobFamilyType[]> => {
  return useQuery({
    queryKey: jobFamilyQueryKeys.ALL_JOB_FAMILIES,
    queryFn: () => authFetch.get(jobFamilyEndpoints.JOB_FAMILY),
    select: (data) => {
      const allJobFamilies = data?.data?.results?.map(
        (jobFamily: AllJobFamilyType) => ({
          ...jobFamily,
          jobTitles: jobFamily.jobTitles.map((jobTitle) => ({
            jobTitleId: jobTitle.jobTitleId,
            name: jobTitle.name
          }))
        })
      );

      const jobFamiliesWithSortedJobTitles = allJobFamilies.map(
        (jobFamily: AllJobFamilyType) => ({
          ...jobFamily,
          jobTitles: sortJobTitlesArrayInAscendingOrder(jobFamily.jobTitles)
        })
      );

      const sortedJobFamilies = sortJobFamilyArrayInAscendingOrder(
        jobFamiliesWithSortedJobTitles
      );

      return sortedJobFamilies || [];
    }
  });
};

export const useAddJobFamily = (onSuccess: () => void, onError: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobFamilyData: AddJobFamilyMutationType) => {
      return authFetch.post(jobFamilyEndpoints.JOB_FAMILY, jobFamilyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobFamilyQueryKeys.ALL_JOB_FAMILIES
      });
      queryClient.invalidateQueries({
        queryKey: quickSetupQueryKeys.QUICK_SETUP_PROGRESS
      });
      onSuccess();
    },
    onError
  });
};

export const useEditJobFamily = (
  onSuccess: () => void,
  onError: () => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (editJobFamilyData: EditJobFamilyMutationType) => {
      const payload = {
        name: editJobFamilyData.name,
        titles: editJobFamilyData.titles
      };

      return authFetch.patch(
        jobFamilyEndpoints.EDIT_JOB_FAMILY(editJobFamilyData.jobFamilyId),
        payload
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobFamilyQueryKeys.ALL_JOB_FAMILIES
      });
      onSuccess();
    },
    onError
  });
};

export const useDeleteJobFamily = (
  onSuccess: () => void,
  onError: () => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobFamilyId: number) => {
      return authFetch.delete(
        jobFamilyEndpoints.JOB_FAMILY_WITH_ID(jobFamilyId)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobFamilyQueryKeys.ALL_JOB_FAMILIES
      });
      onSuccess();
    },
    onError
  });
};

export const useTransferMembersWithJobFamily = (
  onSuccess: () => void,
  onError: () => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransferMembersWithJobFamilyMutationType) => {
      return authFetch.patch(
        jobFamilyEndpoints.TRANSFER_EMPLOYEES_WITH_JOB_FAMILY_ID(
          data.jobFamilyId
        ),
        data.payload
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobFamilyQueryKeys.ALL_JOB_FAMILIES
      });
      onSuccess();
    },
    onError
  });
};

export const useDeleteJobTitle = (
  onSuccess: () => void,
  onError: () => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobTitleId: number) => {
      return authFetch.delete(jobFamilyEndpoints.JOB_TITLE_WITH_ID(jobTitleId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobFamilyQueryKeys.ALL_JOB_FAMILIES
      });
      onSuccess();
    },
    onError
  });
};

export const useTransferMembersWithJobTitle = (
  onSuccess: () => void,
  onError: () => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransferMembersWithJobTitleMutationType) => {
      return authFetch.patch(
        jobFamilyEndpoints.TRANSFER_EMPLOYEES_WITH_JOB_TITLE_ID(
          data.jobTitleId
        ),
        data.payload
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobFamilyQueryKeys.ALL_JOB_FAMILIES
      });
      onSuccess();
    },
    onError
  });
};
