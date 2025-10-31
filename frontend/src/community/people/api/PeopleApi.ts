import {
  type UseInfiniteQueryResult,
  type UseQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { rejects } from "assert";
import { AxiosResponse } from "axios";

import { appModes } from "~community/common/constants/configs";
import { ToastType } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { BulkUploadResponse } from "~community/common/types/BulkUploadTypes";
import {
  ErrorResponse,
  ManagerTypes
} from "~community/common/types/CommonTypes";
import authFetch, {
  authFetchV2
} from "~community/common/utils/axiosInterceptor";
import { removeSpecialCharacters } from "~community/common/utils/commonUtil";
import { leaveBulkUploadResponse } from "~community/leave/types/LeaveTypes";
import {
  GetRolePreProcessor,
  employeeCreatePreProcessor,
  employeeUpdatePreProcessor,
  searchEmployeeDataPreProcessor
} from "~community/people/actions/PeopleDataPreprocessor";
import {
  authEndpoints,
  peoplesEndpoints
} from "~community/people/api/utils/ApiEndpoints";
import { peopleQueryKeys } from "~community/people/api/utils/QueryKeys";
import { usePeopleStore } from "~community/people/store/store";
import { EmployeeType } from "~community/people/types/AddNewResourceTypes";
import { EntitlementInfo } from "~community/people/types/EmployeeBulkUpload";
import {
  BulkEmployeeDetails,
  EmployeeDataExists,
  EmployeeDataParamsTypes,
  EmployeeDataType,
  EmployeeDetails,
  EmployeeManagerType,
  MyManagersType,
  QuickAddEmployeePayload,
  QuickAddEmployeeResponse
} from "~community/people/types/EmployeeTypes";
import { JobFamilies } from "~community/people/types/JobRolesTypes";
import { DirectoryModalTypes } from "~community/people/types/ModalTypes";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import { EmployeeTimelineType } from "~enterprise/people/types/PeopleTypes";

import { AllEmployeeDataResponse, L1EmployeeType } from "../types/PeopleTypes";

const getBannerData = async (): Promise<number> => {
  const url = peoplesEndpoints.GET_PENDING_EMPLOYEE_COUNT;
  const response = await authFetch.get(url);

  const preProcessedData =
    response?.data?.results[0]?.loginPendingEmployeeCount || 0;
  return preProcessedData;
};

export const useGetBannerData = (): UseQueryResult<number> => {
  return useQuery({
    queryKey: peopleQueryKeys.PENDING_EMPLOYEE_COUNT,
    queryFn: getBannerData
  });
};

export const useGetAllEmployeeData = (): UseQueryResult<EmployeeDataType> => {
  const params: EmployeeDataParamsTypes = usePeopleStore(
    (state) => state.employeeDataParams
  );

  return useQuery({
    queryKey: peopleQueryKeys.ALL_EMPLOYEE_DATA(params),
    queryFn: async ({ pageParam = 0 }) =>
      authFetch.get(peoplesEndpoints.GET_EMPLOYEES, {
        params: {
          page: pageParam,
          ...params
        }
      }),
    select: (data) => {
      return data?.data?.results ?? [];
    }
  });
};

export const useGetEmployeeData =
  (): UseInfiniteQueryResult<AllEmployeeDataResponse> => {
    const params: EmployeeDataParamsTypes = usePeopleStore(
      (state) => state.employeeDataParams
    );

    return useInfiniteQuery({
      initialPageParam: 0,
      queryKey: peopleQueryKeys.EMPLOYEE_DATA_TABLE(params),
      queryFn: async ({ pageParam = 0 }) => {
        const url = peoplesEndpoints.GET_EMPLOYEES;
        const employeeData = await authFetchV2.get(url, {
          params: {
            page: pageParam,
            ...params
          }
        });

        return employeeData?.data?.results?.[0];
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
      },
      refetchOnWindowFocus: false
    });
  };

const addNewResourceData = async (
  employeeDetails: EmployeeType
): Promise<AxiosResponse> => {
  return await authFetch.post(peoplesEndpoints.ADD_EMPLOYEE, {
    ...employeeCreatePreProcessor(employeeDetails)
  });
};

const reviteEmployees = async (
  employeeIds: number[]
): Promise<AxiosResponse> => {
  return await authFetch.post(peoplesEndpoints.REVITE_EMPLOYEES, {
    ids: employeeIds
  });
};

export const useHandleAddNewResource = () => {
  const queryClient = useQueryClient();
  const params = usePeopleStore((state) => state.employeeDataParams);

  return useMutation({
    mutationFn: addNewResourceData,
    onSuccess: () => {
      queryClient
        .invalidateQueries({
          queryKey: peopleQueryKeys.EMPLOYEE_COUNT()
        })
        .catch(rejects);
      queryClient
        .invalidateQueries({
          queryKey: peopleQueryKeys.EMPLOYEE_DATA_TABLE(params)
        })
        .catch(rejects);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries();
    }
  });
};

export const useHandleReviteEmployees = (
  onSuccess: () => void,
  onError: () => void
) => {
  return useMutation({
    mutationFn: reviteEmployees,
    onSuccess,
    onError
  });
};

const addBulkEntitlementsWithoutCSV = async (
  updatedEntitlementInfo: EntitlementInfo
) => {
  const response = await authFetch.post(
    peoplesEndpoints.BULK_LEAVES,
    updatedEntitlementInfo
  );
  return response?.data?.results?.[0] as leaveBulkUploadResponse;
};

export const useAddUserBulkEntitlementsWithoutCSV = (
  onSuccess: (response: leaveBulkUploadResponse) => void,
  onError: () => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addBulkEntitlementsWithoutCSV,
    onSuccess: (responseData: leaveBulkUploadResponse) => {
      onSuccess(responseData);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries();
    },
    onError
  });
};

export const useGetSearchedEmployees = (
  searchTerm: string,
  permission = "EMPLOYEES"
) => {
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const queryKey = peopleQueryKeys.EMPLOYEE_SEARCH(
    debouncedSearchTerm,
    permission
  );

  const queryFn = async () => {
    const sanitizedSearchTerm = removeSpecialCharacters(searchTerm, "_");
    const endpoint = peoplesEndpoints.SEARCH_EMPLOYEE;
    const response = await authFetch.get(endpoint, {
      params: { keyword: sanitizedSearchTerm, permission: permission }
    });
    const processedData = searchEmployeeDataPreProcessor(
      response?.data?.results
    );
    return processedData;
  };

  return useQuery({
    queryKey,
    queryFn,
    refetchOnWindowFocus: false,
    enabled: debouncedSearchTerm.length > 0
  });
};

export const useCheckEmailAndIdentificationNo = (
  workEmail: string,
  identificationNo: string
): UseQueryResult<EmployeeDataExists> => {
  return useQuery({
    queryKey: peopleQueryKeys.EMPLOYEE_DATA_EXIST_KEYS(
      workEmail,
      identificationNo
    ),
    queryFn: async () => {
      const url = peoplesEndpoints.CHECK_EXISTING_EMAIL_EMPID;
      const params = { workEmail, identificationNo };
      const response = await authFetch.get(url, { params });

      return response?.data?.results[0];
    },
    enabled: false
  });
};

const getJobRoles = async (): Promise<JobFamilies[]> => {
  const url: string = peoplesEndpoints.JOB_ROLES;
  const result = await authFetch.get(url);
  return GetRolePreProcessor(result?.data?.results);
};

export const useGetPreprocessedRoles = (): UseQueryResult<JobFamilies[]> => {
  return useQuery({
    queryKey: peopleQueryKeys.PRE_PROCESSED_ROLES(),
    queryFn: getJobRoles
  });
};

export const useQuickAddEmployeeMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const {
    setSharedCredentialData,
    setDirectoryModalType,
    setIsDirectoryModalOpen
  } = usePeopleStore((state) => state);

  const { setToastMessage } = useToast();
  const environment = useGetEnvironment();
  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "generalDetails"
  );
  return useMutation({
    mutationFn: async (payload: QuickAddEmployeePayload) => {
      const response = await authFetch.post(
        peoplesEndpoints.QUICK_ADD_EMPLOYEE,
        payload
      );
      return response?.data?.results[0] as QuickAddEmployeeResponse;
    },
    onSuccess: (data: QuickAddEmployeeResponse) => {
      if (environment === appModes.COMMUNITY) {
        setSharedCredentialData(data);
        setDirectoryModalType(DirectoryModalTypes.USER_CREDENTIALS);
      } else {
        setDirectoryModalType(DirectoryModalTypes.NONE);
        setIsDirectoryModalOpen(false);
        setToastMessage({
          toastType: ToastType.SUCCESS,
          title: translateText(["quickAddSuccessTitle"]),
          description: translateText(["quickAddSuccessDescription"]),
          open: true
        });
      }
      queryClient
        .invalidateQueries({
          queryKey: peopleQueryKeys.EMPLOYEE_COUNT()
        })
        .catch(rejects);
      queryClient
        .invalidateQueries({
          queryKey: peopleQueryKeys.EMPLOYEE_DATA_TABLE()
        })
        .catch(rejects);
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: () => {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["quickAddErrorTitle"]),
        description: translateText(["apiQuickAddErrorDescription"])
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries();
    }
  });
};

export const useSharePassword = (
  userId: number
): UseQueryResult<QuickAddEmployeeResponse> => {
  return useQuery({
    queryKey: [peopleQueryKeys.SHARE_PASSWORD(userId), userId],
    queryFn: async () => {
      const response = await authFetch.get(
        authEndpoints.SHARE_PASSWORD(userId as number)
      );
      return response.data.results[0];
    }
  });
};

export const useResetSharePassword = () => {
  return useMutation({
    mutationFn: async (userId: number) => {
      const response = await authFetch.get(
        authEndpoints.RESET_SHARE_PASSWORD(userId)
      );
      return response.data.results;
    }
  });
};

export const useGetEmployeeById = (
  memberId: number | undefined = undefined
): UseQueryResult<EmployeeDetails> => {
  return useQuery({
    queryKey: peopleQueryKeys.EMPLOYEE_BY_ID(memberId),
    queryFn: async () => {
      return await authFetch.get(
        peoplesEndpoints.EMPLOYEE_BY_ID(memberId as number)
      );
    },
    select: (response) => {
      if (response?.data.results?.length) {
        const primaryManager = response?.data.results?.[0]?.employees?.find(
          (manager: EmployeeManagerType) =>
            manager.managerType === ManagerTypes.PRIMARY
        );

        const secondaryManager = response?.data?.results?.[0]?.employees?.find(
          (manager: EmployeeManagerType) =>
            manager?.managerType === ManagerTypes.SECONDARY
        );

        return {
          ...response.data?.results[0],
          primaryManager: primaryManager?.manager,
          secondaryManager: secondaryManager?.manager
        };
      }
    },
    enabled: memberId !== 0
  });
};

const updateResourceData = async (
  employeeDetails: EmployeeType
): Promise<AxiosResponse> => {
  return await authFetch.patch(
    peoplesEndpoints.EDIT_EMPLOYEE(employeeDetails?.employeeId as number),
    {
      ...employeeUpdatePreProcessor(employeeDetails)
    }
  );
};

export const useGetUserPersonalDetails =
  (): UseQueryResult<EmployeeDetails> => {
    return useQuery({
      queryKey: ["me"],
      queryFn: getUserPersonalDetails,
      select: (response) => {
        if (response?.data?.results?.length) {
          return response.data.results[0];
        }
      }
    });
  };

export const useHandleEditNewResource = (
  onSuccess: () => void,
  onError: (error: string) => void
) => {
  const queryClient = useQueryClient();
  const params = usePeopleStore((state) => state.employeeDataParams);
  return useMutation({
    mutationFn: updateResourceData,
    onSuccess: () => {
      onSuccess();
      queryClient
        .invalidateQueries({
          queryKey: peopleQueryKeys.EMPLOYEE_COUNT()
        })
        .catch(rejects);
      queryClient
        .invalidateQueries({
          queryKey: peopleQueryKeys.EMPLOYEE_DATA_TABLE(params)
        })
        .catch(rejects);
      queryClient
        .invalidateQueries({
          queryKey: peopleQueryKeys.GET_ME
        })
        .catch(rejects);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries();
    },
    onError: (error: ErrorResponse) => {
      onError(error?.response?.data?.results?.[0]?.message ?? "");
    }
  });
};

export const getUserPersonalDetails = async (): Promise<AxiosResponse> => {
  const response = await authFetch.get(peoplesEndpoints.ME);
  return response;
};

const updatePersonalData = async (
  employeeData: EmployeeType
): Promise<AxiosResponse> => {
  return await authFetch.patch(
    peoplesEndpoints.EDIT_ME(employeeData?.employeeId as number),
    {
      ...employeeUpdatePreProcessor(employeeData)
    }
  );
};

export const useUpdatePersonalDetails = (
  onSuccess: () => void,
  onError: (error: string) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePersonalData,
    onSuccess: () => {
      onSuccess();
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: peopleQueryKeys.GET_ME
      });
    },
    onError: (error: ErrorResponse) => {
      onError(error?.response?.data?.results?.[0]?.message ?? "");
    }
  });
};

export const useUpdateLeaveManagerData = (
  id: string,
  onSuccess: () => void,
  onError: (error: string) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePersonalData,
    onSuccess: () => {
      onSuccess();
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: peopleQueryKeys.GET_ME
      });
      await queryClient.invalidateQueries({
        queryKey: peopleQueryKeys.EMPLOYEE_BY_ID(Number(id))
      });
    },
    onError: (error: ErrorResponse) => {
      onError(error?.response?.data?.results?.[0]?.message ?? "");
    }
  });
};

export const useGetEmployeeTimeline = (
  memberId: number,
  isEnabled: boolean = true
): UseQueryResult<EmployeeTimelineType[]> => {
  return useQuery({
    queryKey: ["employeeTimeline", memberId],
    queryFn: async () => {
      return await authFetch.get(peoplesEndpoints.EMPLOYEE_TIMELINE(memberId));
    },
    select: (data) => {
      const employeeTimeline = data?.data?.results || [];

      return employeeTimeline;
    },
    enabled: isEnabled && memberId !== 0
  });
};

export const useAddBulkUsers = (
  userArray: BulkEmployeeDetails[],
  onSuccess: (response: BulkUploadResponse) => void,
  onError: () => void
) => {
  const queryClient = useQueryClient();
  const params = usePeopleStore((state) => state.employeeDataParams);
  return useMutation({
    mutationFn: async () => {
      const response = await authFetch.post(
        peoplesEndpoints.USER_BULK_UPLOAD,
        userArray
      );
      return response;
    },
    onSuccess: (response) => {
      onSuccess(response?.data?.results?.[0]);
      queryClient
        .invalidateQueries({
          queryKey: peopleQueryKeys.EMPLOYEE_DATA_TABLE(params)
        })
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

export const useTerminateUser = (
  onSuccess: () => void,
  onError: () => void
) => {
  const queryClient = useQueryClient();

  const { selectedEmployeeId } = usePeopleStore((state) => state);
  return useMutation({
    mutationFn: () => {
      const payload = {
        userId: selectedEmployeeId,
        isActive: false
      };

      return authFetch.patch(
        peoplesEndpoints.TERMINATE_EMPLOYEE(selectedEmployeeId as number),
        payload
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: peopleQueryKeys.EMPLOYEE_BY_ID(Number(selectedEmployeeId))
      });
      onSuccess();
    },
    onError
  });
};

export const useCheckIfUserHasManagers = (): UseQueryResult<boolean> => {
  return useQuery({
    queryKey: peopleQueryKeys.CHECK_IF_CURRENT_USER_HAS_MANAGERS,
    queryFn: async () => {
      const url =
        peoplesEndpoints.CHECK_IF_CURRENT_USER_HAS_MANAGERS_AVAILABILITY;
      const response = await authFetch.get(url);
      return response?.data?.results[0];
    }
  });
};

export const useGetMyManagers = (): UseQueryResult<MyManagersType[]> => {
  return useQuery({
    queryKey: peopleQueryKeys.MY_MANAGERS,
    queryFn: async () => await authFetch.get(peoplesEndpoints.MY_MANAGERS),
    select: (data) => data?.data?.results
  });
};

export const useGetEmployeesAndTeamsForAnalytics = (searchTerm: string) => {
  const debouncedTerm = useDebounce(searchTerm, 500);
  return useQuery({
    queryKey: peopleQueryKeys.getAnalyticEmployeeTeam(debouncedTerm),
    queryFn: async () => {
      const result = await authFetch.get(
        peoplesEndpoints.SEARCH_EMPLOYEE_TEAM_ADMIN,
        {
          params: {
            keyword: debouncedTerm
          }
        }
      );
      return result?.data?.results[0];
    },
    refetchOnWindowFocus: false
  });
};

export const useCheckEmailAndIdentificationNoForQuickAdd = (
  workEmail: string,
  identificationNo: string
): UseQueryResult<EmployeeDataExists> => {
  return useQuery({
    queryKey: peopleQueryKeys.EMPLOYEE_DATA_EXIST_KEYS_QUICK_ADD(
      workEmail,
      identificationNo
    ),
    queryFn: async () => {
      const url = peoplesEndpoints.CHECK_EXISTING_EMAIL_EMPID;
      const params = { workEmail, identificationNo };
      const response = await authFetch.get(url, { params });

      return response?.data?.results[0];
    },
    enabled: false
  });
};

export const useGetSupervisedByMe = (
  employeeId: number
): UseQueryResult<any> => {
  return useQuery({
    queryKey: [peopleQueryKeys.SUPERVISED_BY_ME, employeeId],
    queryFn: async () =>
      await authFetch.get(peoplesEndpoints.SUPERVISED_BY_ME(employeeId)),
    select: (data) => data?.data?.results[0],
    enabled: !!employeeId
  });
};

export const useHasSupervisorRoles = (
  employeeId: number
): UseQueryResult<any> => {
  return useQuery({
    queryKey: [peopleQueryKeys.HAS_SUPERVISOR_ROLES, employeeId],
    queryFn: async () =>
      await authFetch.get(peoplesEndpoints.HAS_SUPERVISOR_ROLES(employeeId)),
    select: (data) => data?.data?.results[0],
    enabled: !!employeeId
  });
};

export const useDeleteUser = (onSuccess: () => void, onError: () => void) => {
  const queryClient = useQueryClient();

  const { selectedEmployeeId } = usePeopleStore((state) => state);
  return useMutation({
    mutationFn: () => {
      return authFetch.patch(
        peoplesEndpoints.DELETE_USER(selectedEmployeeId as number)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: peopleQueryKeys.EMPLOYEE_BY_ID(Number(selectedEmployeeId))
      });
      onSuccess();
    },
    onError
  });
};

export const useAddEmployee = (onSuccess: () => void, onError: () => void) => {
  const queryClient = useQueryClient();
  const params = usePeopleStore((state) => state.employeeDataParams);

  return useMutation({
    mutationFn: async (employee: L1EmployeeType) => {
      const response = await authFetch.post(
        peoplesEndpoints.ADD_EMPLOYEE,
        employee
      );
      return response.data;
    },
    onSuccess: () => {
      onSuccess();
      queryClient
        .invalidateQueries({
          queryKey: peopleQueryKeys.EMPLOYEE_COUNT()
        })
        .catch(rejects);
      queryClient
        .invalidateQueries({
          queryKey: peopleQueryKeys.EMPLOYEE_DATA_TABLE(params)
        })
        .catch(rejects);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries();
    },
    onError
  });
};

export const useGetEmployee = (memberId: number | undefined = undefined) => {
  return useQuery({
    queryKey: peopleQueryKeys.EMPLOYEE_BY_ID(memberId),
    queryFn: async () => {
      return await authFetch.get(
        peoplesEndpoints.EMPLOYEE_BY_ID(memberId as number)
      );
    },
    refetchOnWindowFocus: false
  });
};

export const useEditEmployee = (employeeId: string) => {
  const { setToastMessage } = useToast();
  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "commonText"
  );
  const queryClient = useQueryClient();
  const params = usePeopleStore((state) => state.employeeDataParams);
  const {
    setProfilePic,
    setIsReinviteConfirmationModalOpen,
    isReinviteConfirmationModalOpen
  } = usePeopleStore((state) => state);

  return useMutation({
    mutationFn: async (employee: L1EmployeeType) => {
      const response = await authFetch.patch(
        peoplesEndpoints.EDIT_EMPLOYEE(employeeId),
        employee
      );
      return response.data;
    },
    onSuccess: () => {
      setProfilePic(null);
      if (isReinviteConfirmationModalOpen) {
        setToastMessage({
          open: true,
          toastType: ToastType.SUCCESS,
          title: translateText([
            "reInvitationForOneEmployeeSuccessfulToastTitle"
          ]),
          description: translateText([
            "reInvitationForOneEmployeeSuccessfulToastDescription"
          ])
        });
        setIsReinviteConfirmationModalOpen(false);
      } else {
        setToastMessage({
          open: true,
          toastType: ToastType.SUCCESS,
          title: translateText(["editToastTitle"]),
          description: translateText(["editToastDescription"])
        });
      }

      queryClient
        .invalidateQueries({
          queryKey: peopleQueryKeys.EMPLOYEE_COUNT()
        })
        .catch(rejects);
      queryClient
        .invalidateQueries({
          queryKey: peopleQueryKeys.EMPLOYEE_DATA_TABLE(params)
        })
        .catch(rejects);
      queryClient
        .invalidateQueries({
          queryKey: peopleQueryKeys.GET_ME
        })
        .catch(rejects);
    },
    onError: () => {
      setIsReinviteConfirmationModalOpen(false);
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["editErrorToastTitle"]),
        description: translateText(["editErrorToastDescription"])
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries();
    }
  });
};
