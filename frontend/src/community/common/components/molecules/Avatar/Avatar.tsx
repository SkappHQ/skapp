import {
  Box,
  Avatar as MuiAvatar,
  type AvatarProps as MuiAvatarProps,
  Stack,
  type SxProps
} from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { type FC, useEffect, useState } from "react";
import { type DropzoneInputProps } from "react-dropzone";

import { useGetUploadedImage } from "~community/common/api/FileHandleApi";
import DefaultAvatar from "~community/common/components/atoms/DefaultAvatar/DefaultAvatar";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { appModes } from "~community/common/constants/configs";
import { FileTypes } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { notificationDefaultImage } from "~community/common/types/notificationTypes";
import { mergeSx } from "~community/common/utils/commonUtil";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import useS3Download from "~enterprise/common/hooks/useS3Download";

import styles from "./styles";

interface AvatarProps extends MuiAvatarProps {
  firstName: string;
  lastName: string;
  src: string;
  staticImageSrc?: string;
  avatarStyles?: SxProps;
  getInputProps?: <T extends DropzoneInputProps>(props?: T) => T;
  handleUnSelectPhoto?: () => void;
  open?: () => void;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  enableEdit?: boolean;
  imageUploaded?: boolean;
  "data-testid"?: string;
  isOriginalImage?: boolean;
}

const Avatar: FC<AvatarProps> = ({
  firstName,
  lastName,
  src,
  staticImageSrc,
  avatarStyles,
  children,
  isOriginalImage = false,
  getInputProps,
  handleUnSelectPhoto,
  open,
  onClick,
  onMouseEnter,
  onMouseLeave,
  enableEdit = false,
  imageUploaded = false,
  "data-testid": testId
}) => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const translateAria = useTranslator("commonAria", "components", "avatar");

  const { s3FileUrls, downloadS3File } = useS3Download();

  const [image, setImage] = useState<string | null>(null);

  const environment = useGetEnvironment();

  const { data: logoUrl } = useGetUploadedImage(
    FileTypes.USER_IMAGE,
    src,
    true,
    environment !== appModes.ENTERPRISE
  );

  useEffect(() => {
    if (environment === appModes.COMMUNITY) {
      if (logoUrl) setImage(logoUrl);
      else if (src) setImage(src);
    } else if (environment === appModes.ENTERPRISE) {
      if (src) {
        if (src === notificationDefaultImage) {
          setImage(notificationDefaultImage);
        } else {
          setImage(s3FileUrls[src] ?? src);
        }
      }
    }
  }, [logoUrl, src, s3FileUrls, environment]);

  useEffect(() => {
    if (src || !s3FileUrls[src]) {
      downloadS3File({
        filePath: src,
        isProfilePic: true,
        isOriginalImage: isOriginalImage
      });
    }
  }, [src, isOriginalImage]);

  const renderAvatar = () => {
    if (image) {
      return (
        <MuiAvatar
          src={image}
          sx={avatarStyles}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          alt={`${firstName} ${lastName}` || translateAria(["avatar"])}
        >
          {children}
        </MuiAvatar>
      );
    }

    return (
      <DefaultAvatar
        firstName={firstName}
        lastName={lastName}
        containerStyles={
          mergeSx([avatarStyles, classes.defaultAvatarContainer]) as SxProps
        }
        typographyStyles={classes.defaultAvatarTypography}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        alt={`${firstName} ${lastName}` || translateAria(["avatar"])}
      />
    );
  };

  const handleUnselect = () => {
    handleUnSelectPhoto?.();
    setImage(null);
  };
  const renderEditIcon = () => {
    if (!enableEdit) return null;

    return (
      <Box>
        <input
          id="imageInput"
          {...(getInputProps ? getInputProps() : {})}
          aria-label={
            imageUploaded
              ? translateAria(["removeProfilePicture"])
              : translateAria(["uploadProfilePicture"])
          }
        />
        <Box
          sx={classes.iconWrapper}
          onClick={imageUploaded ? handleUnselect : open}
          data-testid={testId}
          role="button"
          tabIndex={0}
          aria-label={
            imageUploaded
              ? translateAria(["removeProfilePicture"])
              : translateAria(["changeProfileAvatar"])
          }
        >
          <Icon
            name={
              imageUploaded
                ? IconName.REQUEST_CANCEL_CROSS_ICON
                : IconName.EDIT_ICON
            }
            fill={theme.palette.primary.dark}
          />
        </Box>
      </Box>
    );
  };

  return (
    <Stack sx={classes.wrapper}>
      <Stack sx={classes.container}>
        {renderAvatar()}
        {renderEditIcon()}
      </Stack>
    </Stack>
  );
};

export default Avatar;
