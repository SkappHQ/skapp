import { Box, type SxProps, Typography } from "@mui/material";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";

import { useGetUploadedImage } from "~community/common/api/FileHandleApi";
import Avatar from "~community/common/components/molecules/Avatar/Avatar";
import { appModes } from "~community/common/constants/configs";
import { accountPageTestId } from "~community/common/constants/testIds";
import { FileTypes } from "~community/common/enums/CommonEnums";
import { theme } from "~community/common/theme/theme";
import { usePeopleStore } from "~community/people/store/store";
import { ModifiedFileType } from "~community/people/types/AddNewResourceTypes";
import { L1EmployeeType } from "~community/people/types/PeopleTypes";
import generateThumbnail from "~community/people/utils/image/thumbnailGenerator";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";

interface Props {
  selectedUser: L1EmployeeType;
  styles?: SxProps;
  isLoading?: boolean;
  isSuccess?: boolean;
  enableEdit?: boolean;
}

const UserDetailsCentered: FC<Props> = ({
  selectedUser,
  styles,
  enableEdit = false
}) => {
  const [profilePicture, setProfilePicture] = useState<string>();

  const { employee, thumbnail, setCommonDetails, setThumbnail, setProfilePic } =
    usePeopleStore((state) => state);

  const environment = useGetEnvironment();

  const cardData = useMemo(() => {
    return {
      employeeId:
        selectedUser?.employment?.employmentDetails?.employeeNumber?.toString() ||
        "",
      authPic: selectedUser?.common?.authPic || "",
      thumbnail: thumbnail || "",
      firstName: selectedUser?.personal?.general?.firstName ?? "",
      lastName: selectedUser?.personal?.general?.lastName || "",
      fullName:
        selectedUser?.personal?.general?.firstName?.concat(
          " ",
          selectedUser?.personal?.general?.lastName ?? ""
        ) || "",
      jobTitle: selectedUser?.common?.jobTitle || ""
    };
  }, [selectedUser]);

  const onDrop: (acceptedFiles: File[]) => void = useCallback(
    (acceptedFiles: File[]) => {
      const profilePic = acceptedFiles.map((file: File) =>
        Object.assign(file, { preview: URL.createObjectURL(file) })
      );

      setCommonDetails({
        authPic: profilePic[0]?.preview ?? ""
      });

      setProfilePic(profilePic as ModifiedFileType[]);

      generateThumbnail(profilePic[0] as ModifiedFileType).then((thumbnail) =>
        setThumbnail(thumbnail)
      );
    },
    [employee?.common?.employeeId]
  );

  const { open, getInputProps } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: {
      "image/svg+xml": [],
      "image/png": [],
      "image/jpg": [],
      "image/jpeg": []
    }
  });

  const { data: uploadedImage, isLoading } = useGetUploadedImage(
    FileTypes.USER_IMAGE,
    cardData?.authPic,
    true,
    environment !== appModes.ENTERPRISE
  );

  const handleUnSelectPhoto = (): void => {
    setProfilePic([]);
    setThumbnail([]);
    setCommonDetails({
      authPic: ""
    });
    setProfilePicture("");
  };

  useEffect(() => {
    if (!isLoading && uploadedImage) {
      setProfilePicture(uploadedImage);
    }
  }, [isLoading, uploadedImage]);

  const getAvatarThumbnailUrl = useCallback((): string => {
    if (employee?.common?.authPic !== undefined) {
      if (Array.isArray(employee?.common?.authPic)) {
        return employee?.common?.authPic[0]?.preview;
      }
      return employee?.common?.authPic ?? "";
    } else if (profilePicture !== undefined) {
      return profilePicture;
    }

    return "";
  }, [profilePicture, employee?.common?.authPic]);

  return (
    <Box
      component="div"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        ...styles
      }}
    >
      <Box
        component="div"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center"
        }}
      >
        <Avatar
          id="avatar"
          firstName={cardData?.firstName}
          lastName={cardData?.lastName}
          src={getAvatarThumbnailUrl()}
          avatarStyles={{
            width: "6.125rem",
            height: "6.125rem",
            border: "none"
          }}
          getInputProps={getInputProps}
          handleUnSelectPhoto={handleUnSelectPhoto}
          open={open}
          enableEdit={enableEdit}
          imageUploaded={
            cardData?.authPic !== ((employee?.common?.authPic as string) ?? "")
          }
          data-testid={accountPageTestId.UserDetailsCentered.profileAvatar}
        />
        <Box
          component="div"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "0.5rem",
            textAlign: "center"
          }}
        >
          <Typography
            variant="body1"
            component="h3"
            sx={{
              fontWeight: 700,
              lineHeight: "1.875rem",
              fontSize: "1.25rem"
            }}
          >
            {cardData?.fullName}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 400,
              lineHeight: "1.5rem",
              fontSize: "1rem",
              color: theme.palette.text.secondary
            }}
          >
            {cardData?.jobTitle}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default UserDetailsCentered;
