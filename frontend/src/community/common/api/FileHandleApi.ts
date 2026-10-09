import { useMutation, useQueries, useQuery } from "@tanstack/react-query";

import { fileUploadEndpoints } from "~community/people/api/utils/ApiEndpoints";

import authFetch from "../utils/axiosInterceptor";

export const useUploadImages = () => {
  return useMutation({
    mutationFn: async (fileData: FormData) => {
      const response = await authFetch.post(
        fileUploadEndpoints.UPLOAD_IMAGES,
        fileData
      );
      return response?.data?.results?.[0];
    }
  });
};

const fetchUploadedImage = async (
  type?: string,
  file?: string | null,
  isThumbnail?: boolean
): Promise<string | null> => {
  if (!type || !file) return null;
  const response = await authFetch.get(
    fileUploadEndpoints.DOWNLOAD_IMAGES(type, file, isThumbnail ?? false),
    {
      responseType: "blob"
    }
  );

  const fileBlob = await response.data;
  const url = URL.createObjectURL(fileBlob);

  return url;
};

export const useGetUploadedImage = (
  type?: string,
  file?: string | null,
  isThumbnail?: boolean,
  enable?: boolean
) => {
  return useQuery({
    queryKey: ["download-file", type, file, isThumbnail],
    queryFn: () => fetchUploadedImage(type, file, isThumbnail),
    enabled: Boolean(type && file && enable)
  });
};

export const useGetUploadedImages = (
  type: string,
  files: string[],
  isThumbnail?: boolean,
  enable?: boolean
) => {
  return useQueries({
    queries: files.map((file) => ({
      queryKey: ["download-file", type, file, isThumbnail],
      queryFn: () => fetchUploadedImage(type, file, isThumbnail),
      enabled: Boolean(type && file && enable)
    }))
  });
};

export const useGetUploadedLeaveAttachments = (
  type?: string,
  file?: string | null,
  isThumbnail?: boolean
) => {
  return useQuery({
    queryKey: ["download-file", type, file, isThumbnail],
    queryFn: async () => {
      if (!type || !file) return null;
      const response = await authFetch.get(
        fileUploadEndpoints.DOWNLOAD_IMAGES(type, file, isThumbnail ?? false),
        {
          responseType: "blob"
        }
      );

      const fileBlob = await response.data;

      return fileBlob;
    },
    enabled: Boolean(type && file)
  });
};
