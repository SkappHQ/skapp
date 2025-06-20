import { Box, Divider, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { parse } from "papaparse";
import { Dispatch, FC, SetStateAction, useState } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import DragAndDropField from "~community/common/components/molecules/DragAndDropField/DragAndDropField";
import ToastMessage from "~community/common/components/molecules/ToastMessage/ToastMessage";
import { ButtonStyle, ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { BulkUploadResponse } from "~community/common/types/BulkUploadTypes";
import {
  FileRejectionType,
  FileUploadType
} from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { useAddBulkUsers } from "~community/people/api/PeopleApi";
import useUserBulkConvert from "~community/people/hooks/useUserBulkConvert";
import useUserBulkValidation from "~community/people/hooks/useUserBulkValidation";
import { usePeopleStore } from "~community/people/store/store";
import { AllJobFamilyType } from "~community/people/types/JobFamilyTypes";
import { DirectoryModalTypes } from "~community/people/types/ModalTypes";
import { BulkUploadUser } from "~community/people/types/UserBulkUploadTypes";
import { convertUserBulkCsvHeaders } from "~community/people/utils/userBulkUploadUtils";
import { QuickSetupModalTypeEnums } from "~enterprise/common/enums/Common";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";

interface Props {
  jobRoleList: AllJobFamilyType[] | undefined;
  setBulkUploadData: Dispatch<SetStateAction<BulkUploadResponse | undefined>>;
  setPopupType: (value: DirectoryModalTypes) => void;
}

const UserBulkCsvUpload: FC<Props> = ({
  jobRoleList = [],
  setBulkUploadData,
  setPopupType
}) => {
  const theme: Theme = useTheme();
  const { setToastMessage, toastMessage } = useToast();
  const { bulkUploadUsers, setBulkUploadUsers } = usePeopleStore(
    (state) => state
  );

  const {
    ongoingQuickSetup,
    setQuickSetupModalType,
    stopAllOngoingQuickSetup
  } = useCommonEnterpriseStore((state) => ({
    ongoingQuickSetup: state.ongoingQuickSetup,
    setQuickSetupModalType: state.setQuickSetupModalType,
    stopAllOngoingQuickSetup: state.stopAllOngoingQuickSetup
  }));

  const [, setAttachmentError] = useState(false);
  const [bulkUserAttachment, setBulkUserAttachment] = useState<
    FileUploadType[]
  >([]);
  const [fileError, setFileError] = useState<string>("");
  const translateText = useTranslator("peopleModule", "peoples");
  const translateAria = useTranslator("peopleAria", "directory");
  const { isCsvValid } = useUserBulkValidation();
  const { convertUsers } = useUserBulkConvert();

  const setAttachment = (acceptedFiles: FileUploadType[]): void => {
    setFileError("");
    setAttachmentError(false);
    if (acceptedFiles?.[0]?.file) {
      parse(acceptedFiles?.[0]?.file, {
        header: true,
        skipEmptyLines: "greedy",
        transformHeader: convertUserBulkCsvHeaders,
        complete: function (results: any) {
          if (results?.data?.length === 0) {
            setFileError(translateText(["bulkUploadEmptyCsvError"]));
          } else if (
            isCsvValid(results?.data as BulkUploadUser[]) &&
            results?.data?.length > 0
          ) {
            const newUserArray = convertUsers(
              results?.data as BulkUploadUser[],
              jobRoleList
            );
            setBulkUploadUsers(newUserArray);
          } else {
            setFileError(translateText(["templateError"]));
          }
        }
      });
    } else {
      setFileError(translateText(["templateError"]));
    }
  };

  const onSuccess = (response: BulkUploadResponse) => {
    if (response) {
      setBulkUploadData(response);
      if (response?.bulkStatusSummary?.failedCount > 0)
        setPopupType(DirectoryModalTypes.UPLOAD_SUMMARY);
      else {
        setPopupType(DirectoryModalTypes.NONE);
        if (ongoingQuickSetup.INVITE_EMPLOYEES) {
          setQuickSetupModalType(QuickSetupModalTypeEnums.IN_PROGRESS_START_UP);
          stopAllOngoingQuickSetup();
        }
        setToastMessage({
          toastType: ToastType.SUCCESS,
          open: true,
          title: translateText(["bulkUploadSuccessTitle"]),
          description: translateText(["bulkUploadSuccessDes"])
        });
      }
    }
    setBulkUploadUsers([]);
    setBulkUserAttachment([]);
  };

  const onError = () => {
    setToastMessage({
      toastType: ToastType.ERROR,
      open: true,
      title: translateText(["bulkUploadErrorTitle"]),
      description: translateText(["bulkUploadErrorDes"])
    });
    setBulkUploadUsers([]);
    setBulkUserAttachment([]);
    setPopupType(DirectoryModalTypes.NONE);
  };

  const { mutate, isPending } = useAddBulkUsers(
    bulkUploadUsers,
    onSuccess,
    onError
  );

  const handleUploadBtn = () => {
    mutate();
  };

  const handleCancelBtn = () => {
    setBulkUploadUsers([]);
    setBulkUserAttachment([]);
    setPopupType(DirectoryModalTypes.DOWNLOAD_CSV);
  };

  return (
    <Box
      sx={{
        borderRadius: "0.75rem",
        height: "100%",
        pt: "1rem"
      }}
    >
      <Typography sx={{ fontSize: "1rem", fontWeight: 400, mb: "0.5rem" }}>
        {translateText(["uploadCsvDes"])}
      </Typography>
      <DragAndDropField
        setAttachmentErrors={(errors: FileRejectionType[]) => {
          setAttachmentError(!!errors?.length);
        }}
        setAttachments={(acceptedFiles: FileUploadType[]) => {
          setBulkUserAttachment(acceptedFiles);
          setAttachment(acceptedFiles);
        }}
        accept={{
          "text/csv": [".csv"]
        }}
        uploadableFiles={bulkUserAttachment}
        supportedFiles={".csv"}
        maxFileSize={1}
        isZeroFilesErrorRequired={false}
        accessibility={{
          componentName: translateAria(["userBulkUpload"])
        }}
      />
      {bulkUserAttachment?.[0]?.file && !!fileError && (
        <Box role="alert">
          <Typography
            variant="body2"
            sx={{ color: theme.palette.error.contrastText, mt: 1 }}
          >
            {fileError}
          </Typography>
        </Box>
      )}
      <Divider sx={{ mt: "1.5rem", mb: "1.5rem" }} />
      <Button
        label={translateText(["uploadButton"])}
        endIcon={IconName.RIGHT_ARROW_ICON}
        buttonStyle={ButtonStyle.PRIMARY}
        styles={{ mb: "1rem" }}
        onClick={() => handleUploadBtn()}
        isLoading={isPending}
        disabled={bulkUserAttachment?.length === 0}
        shouldBlink={bulkUserAttachment?.length > 0}
        ariaLabel={translateAria(["uploadPeople"])}
      />

      <Button
        startIcon={IconName.LEFT_ARROW_ICON}
        label={translateText(["backButton"])}
        buttonStyle={ButtonStyle.TERTIARY}
        onClick={() => handleCancelBtn()}
      />

      <ToastMessage
        open={toastMessage.open}
        onClose={toastMessage.onClose}
        title={toastMessage.title}
        description={toastMessage.description}
        toastType={toastMessage.toastType}
        autoHideDuration={toastMessage.autoHideDuration}
      />
    </Box>
  );
};

export default UserBulkCsvUpload;
