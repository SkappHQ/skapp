import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Box, Stack, Typography } from "@mui/material";
import { SxProps, type Theme, useTheme } from "@mui/material/styles";
import {
  CSSProperties,
  FC,
  Fragment,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import { type FileRejection, useDropzone } from "react-dropzone";

import { FileUploadErrorTypes } from "~community/common/enums/ErrorTypes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  FileRejectionType,
  FileUploadType
} from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { mergeSx, removeDuplicates } from "~community/common/utils/commonUtil";

import IconChip from "../../atoms/Chips/IconChip.tsx/IconChip";
import Icon from "../../atoms/Icon/Icon";
import { styles } from "./styles";

interface Props {
  accessibility?: {
    componentName?: string;
    ariaDescribedBy?: string;
    ariaHidden?: boolean;
  };
  setAttachmentErrors?: (errors: FileRejectionType[]) => void;
  setAttachments: (acceptedFiles: FileUploadType[]) => void;
  accept: Record<string, string[]>;
  uploadableFiles: FileUploadType[];
  supportedFiles?: string;
  maxFileSize?: number;
  minFileSize?: number;
  fileName?: string;
  isZeroFilesErrorRequired?: boolean;
  isDisableColor?: boolean;
  customError?: string;
  label?: string;
  descriptionStyles?: SxProps;
  browseTextStyles?: SxProps;
  maxSizeOfFile?: {
    inBytes: number;
    inReadableSize: string;
  };
}

const MAX_FILE_SIZE_OF_FILE = 5000000;

const DragAndDropField: FC<Props> = ({
  setAttachments: setAttachment,
  setAttachmentErrors,
  uploadableFiles,
  accept,
  supportedFiles = ".png .jpg .pdf",
  maxFileSize = 1,
  minFileSize = 1,
  fileName = "",
  isZeroFilesErrorRequired = true,
  isDisableColor = false,
  customError,
  label,
  descriptionStyles,
  browseTextStyles,
  maxSizeOfFile = {
    inBytes: MAX_FILE_SIZE_OF_FILE,
    inReadableSize: "5MB"
  },
  accessibility
}) => {
  const translateText = useTranslator("commonComponents", "dragAndDrop");
  const translateAria = useTranslator(
    "commonAria",
    "components",
    "dragAndDrop"
  );

  const errors = {
    // React Dropzone error messages
    tooManyFilesError: translateText(["maxAttachmentsError"], {
      maxFileSize: maxFileSize.toString()
    }),
    fileTooLarge: translateText(["attachmentSizeError"], {
      fileSize: maxSizeOfFile.inReadableSize
    }),
    invalidFileType: translateText(["attachmentTypeError"], { supportedFiles }),

    // Custom error messages
    zeroFilesError: translateText(["emptyAttachmentError"]),
    duplicateFilesError: translateText(["duplicateAttachmentsError"])
  };

  const [, setChipLabel] = useState<string | undefined>("");

  const [validationError, setValidationError] = useState<boolean>(false);
  const [fileUploadErrorsList, setFileUploadErrorsList] = useState<
    Partial<FileRejection>[]
  >([]);

  const theme: Theme = useTheme();
  const classes = styles(theme, isDisableColor, validationError);

  useEffect(() => {
    setValidationError(!!fileUploadErrorsList?.length);
    setAttachmentErrors?.(fileUploadErrorsList);
  }, [fileUploadErrorsList]);

  useEffect(() => {
    const chipLabel = uploadableFiles[1]
      ? uploadableFiles[1]?.name
      : uploadableFiles[0]?.name;
    setChipLabel(chipLabel);
  }, [uploadableFiles]);

  const validateFileUploadOnDrop = useCallback(
    (
      fileRejections: FileRejection[],
      acceptedFiles: File[],
      uniqueFiles: File[]
    ) => {
      if (fileRejections?.length > 0) {
        setFileUploadErrorsList(fileRejections);
      } else if (!acceptedFiles?.length) {
        setFileUploadErrorsList([
          { errors: [{ code: "", message: errors.zeroFilesError }] }
        ]);
      } else if (!uniqueFiles?.length) {
        setFileUploadErrorsList([
          { errors: [{ code: "", message: errors.duplicateFilesError }] }
        ]);
      } else if (maxFileSize !== 1 && uploadableFiles?.length >= maxFileSize) {
        setFileUploadErrorsList([
          {
            errors: [
              {
                code: FileUploadErrorTypes.TOO_MANY_FILES_ERROR,
                message: errors.tooManyFilesError
              }
            ]
          }
        ]);
      } else {
        setFileUploadErrorsList([]);
      }
    },
    [
      errors.duplicateFilesError,
      errors.tooManyFilesError,
      errors.zeroFilesError,
      maxFileSize,
      uploadableFiles?.length
    ]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      validateFileUploadOnDrop(
        fileRejections,
        acceptedFiles,
        removeDuplicates(uploadableFiles, acceptedFiles, maxFileSize)
      );

      acceptedFiles = removeDuplicates(
        uploadableFiles,
        acceptedFiles,
        maxFileSize
      );

      const fileObjectsToUpload: FileUploadType[] = acceptedFiles.map(
        (file: File) => {
          const fileObjectUrl = URL.createObjectURL(file);
          const fileInfo = { file, name: file?.name, path: fileObjectUrl };
          return fileInfo;
        }
      );

      if (maxFileSize === 1) {
        setAttachment(fileObjectsToUpload);
      } else {
        setAttachment([...uploadableFiles, ...fileObjectsToUpload]);
      }
    },
    [maxFileSize, setAttachment, uploadableFiles, validateFileUploadOnDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: maxFileSize - uploadableFiles?.length,
    minSize: minFileSize,
    maxSize: maxSizeOfFile.inBytes
  });

  const handleUnselectItem = (filePath: string): void => {
    const selectedFiles = uploadableFiles?.filter(
      (item) => item?.path !== filePath
    );
    if (selectedFiles.length < minFileSize && isZeroFilesErrorRequired) {
      setFileUploadErrorsList([
        { errors: [{ code: "", message: errors.zeroFilesError }] }
      ]);
    } else if (selectedFiles.length <= maxFileSize) {
      setFileUploadErrorsList([]);
    }
    setAttachment(selectedFiles);
  };

  const getUploadError = useMemo(
    () =>
      (error: { code: string; message: string }): string => {
        switch (error.code) {
          case FileUploadErrorTypes.INVALID_FILE_TYPE_ERROR:
            return errors.invalidFileType;
          case FileUploadErrorTypes.TOO_MANY_FILES_ERROR:
            return errors.tooManyFilesError;
          case FileUploadErrorTypes.FILE_TOO_LARGE_ERROR:
            return errors.fileTooLarge;
          default:
            return error.message;
        }
      },
    [errors.invalidFileType, errors.tooManyFilesError, errors.fileTooLarge]
  );

  const getInlineErrorMessage = useMemo(() => {
    if (customError) {
      return customError;
    }
    if (validationError) {
      if (
        fileUploadErrorsList?.length &&
        fileUploadErrorsList[0]?.errors?.[0]?.message
      ) {
        return getUploadError(fileUploadErrorsList[0].errors[0]);
      }

      return translateText(["validAttachment"]);
    }
    return "";
  }, [
    validationError,
    customError,
    fileUploadErrorsList,
    getUploadError,
    translateText
  ]);

  return (
    <>
      {label ? <Typography sx={classes.labelText}>{label}</Typography> : <> </>}
      <div
        {...getRootProps()}
        style={classes.dragDropContainer as CSSProperties}
      >
        <input
          {...getInputProps({
            "aria-label": translateAria(["ariaLabel"], {
              componentName: accessibility?.componentName
            }),
            "aria-describedby": accessibility?.ariaDescribedBy,
            "aria-hidden": accessibility?.ariaHidden
          })}
        />
        {isDragActive ? (
          <Typography variant="body1">
            {translateText(["description"])}
          </Typography>
        ) : (
          <>
            <Stack>
              <Box
                sx={{
                  pb: "0.3125rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Icon name={IconName.FILE_UPLOAD_ICON} />
              </Box>
              <Typography
                variant="body2"
                sx={mergeSx([classes.desTextStyle, descriptionStyles])}
              >
                {translateText(["dropFileDescription"])} &nbsp;
              </Typography>
            </Stack>
            <Stack>
              <Typography
                variant="body2"
                sx={mergeSx([classes.orText, browseTextStyles])}
              >
                or &nbsp;
                <Typography
                  component="span"
                  variant="body2"
                  sx={{
                    ...(classes.browseText as CSSProperties),
                    ...browseTextStyles
                  }}
                >{`Browse`}</Typography>
              </Typography>
            </Stack>
          </>
        )}
        <Stack alignItems={"center"}>
          {uploadableFiles?.length > 0 || fileName ? (
            <Fragment
              key={
                uploadableFiles[uploadableFiles?.length - 1]
                  ? uploadableFiles[
                      uploadableFiles?.length - 1
                    ]?.name?.toString()
                  : uploadableFiles[0]?.name?.toString()
              }
            >
              <IconChip
                chipStyles={classes.IconChip}
                accessibility={{
                  ariaLabel: translateAria(["uploadedFiles.label"], {
                    fileName:
                      uploadableFiles[uploadableFiles?.length - 1]?.name ?? ""
                  }),
                  ariaDescription: translateAria(["uploadedFiles.description"]),
                  ariaHidden: true
                }}
                label={
                  uploadableFiles[uploadableFiles?.length - 1]
                    ? uploadableFiles[uploadableFiles?.length - 1]?.name
                    : (uploadableFiles[0]?.name ?? "")
                }
                icon={<ContentCopyIcon fontSize="small" />}
                endIcon={<CloseIcon fontSize="small" />}
                onDelete={(event: MouseEvent<HTMLDivElement, MouseEvent>) => {
                  event.stopPropagation();
                  handleUnselectItem(
                    uploadableFiles[uploadableFiles?.length - 1]
                      ? uploadableFiles[uploadableFiles?.length - 1]?.path
                      : (uploadableFiles[0]?.path ?? "")
                  );
                }}
              />
            </Fragment>
          ) : (
            <Typography variant="body2" sx={classes.supportedFileText}>
              {translateText(["supportFiles"])} : {supportedFiles}
            </Typography>
          )}
        </Stack>
      </div>

      <Typography variant="body2" sx={classes.errorText} aria-live="assertive">
        {getInlineErrorMessage}
      </Typography>
    </>
  );
};

export default DragAndDropField;
