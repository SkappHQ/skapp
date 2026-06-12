import { Box, Stack, Typography } from "@mui/material";
import { ButtonV2, SmallModal } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";

import Checkbox from "~community/common/components/atoms/Checkbox/Checkbox";
import Icon from "~community/common/components/atoms/Icon/Icon";
import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import { Modules } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { useUpdateUserRoleRestrictions } from "~community/configurations/api/userRolesApi";
import { useConfigurationStore } from "~community/configurations/stores/configurationStore";
import { UserRoleRestrictionsType } from "~community/configurations/types/UserRolesTypes";

import styles from "./styles";

interface Props {
  initialData: UserRoleRestrictionsType | undefined;
}

const RestrictedUserRolesModal = ({ initialData }: Props) => {
  const classes = styles();

  const translateText = useTranslator("configurations", "userRoles");

  const { setToastMessage } = useToast();

  const {
    moduleType,
    isUserRoleModalOpen,
    setIsUserRoleModalOpen,
    setModuleType
  } = useConfigurationStore();

  const onSuccess = () => {
    setToastMessage({
      open: true,
      toastType: "success",
      title: translateText(["successToastTitle"]),
      description: translateText(["successToastDescription"])
    });
    handleCancelBtnClick();
  };

  const onError = () => {
    setToastMessage({
      open: true,
      toastType: "error",
      title: translateText(["errorToastTitle"]),
      description: translateText(["errorToastDescription"])
    });
  };

  const { mutate: updateUserRoleRestrictions } = useUpdateUserRoleRestrictions(
    onSuccess,
    onError
  );

  const handleCancelBtnClick = () => {
    setIsUserRoleModalOpen(false);
    setModuleType(Modules.NONE);
    resetForm();
  };

  const handleSubmit = () => {
    // TODO: For ESIGN, the backend uses isManager to represent Sender role.
    // This mapping will be removed after the backend's migration is completed.
    const payload: UserRoleRestrictionsType = {
      module: moduleType,
      isAdmin: values.isAdmin,
      isManager:
        moduleType === Modules.ESIGN ? values.isSender : values.isManager,
      ...(moduleType === Modules.CRM && { isEmployee: values.isEmployee })
    };

    updateUserRoleRestrictions(payload);
  };

  // TODO: For ESIGN, the backend uses isManager to represent Sender role.
  // This mapping will be removed after the backend's migration is completed.
  const { values, dirty, setFieldValue, resetForm } = useFormik({
    initialValues: {
      isAdmin: initialData !== undefined ? initialData?.isAdmin : false,
      isManager: initialData !== undefined ? initialData?.isManager : false,
      isSender:
        initialData !== undefined && moduleType === Modules.ESIGN
          ? initialData?.isManager
          : false,
      isEmployee: initialData !== undefined ? initialData?.isEmployee : false
    },
    enableReinitialize: true,
    onSubmit: handleSubmit
  });

  const getRestrictableRoles = (module: Modules): string[] => {
    switch (module) {
      case Modules.ATTENDANCE:
      case Modules.PEOPLE:
      case Modules.LEAVE:
        return ["isAdmin", "isManager"];
      case Modules.ESIGN:
        return ["isAdmin", "isSender"];
      case Modules.INVOICE:
      case Modules.PM:
        return ["isAdmin"];
      case Modules.CRM:
        return ["isAdmin", "isManager", "isEmployee"];
      default:
        return [];
    }
  };

  const restrictableRoles = getRestrictableRoles(moduleType);

  return (
    <SmallModal
      isOpen={isUserRoleModalOpen}
      onClose={handleCancelBtnClick}
      modalHeader={translateText(["restrictedUserRolesTitle"])}
      content={
        <Stack sx={classes.wrapper}>
          <Stack sx={classes.description}>
            <Typography sx={classes.text}>
              {translateText(["restrictedUserRolesDescriptionPartOne"])}
              <b>{translateText(["restrictedUserRolesDescriptionPartTwo"])}</b>
              {translateText(["restrictedUserRolesDescriptionPartThree"])}
            </Typography>
            <Box sx={classes.tooltipWrapper}>
              <Tooltip title={translateText(["restrictedUserRolesTooltip"])} />
            </Box>
          </Stack>
          <Stack sx={classes.fieldWrapper}>
            {restrictableRoles.includes("isAdmin") && (
              <Checkbox
                label={translateText(["adminRoleLabel"])}
                name="isAdmin"
                checked={values.isAdmin}
                onChange={() => setFieldValue("isAdmin", !values.isAdmin)}
              />
            )}
            {restrictableRoles.includes("isManager") && (
              <Checkbox
                label={
                  moduleType === Modules.CRM
                    ? translateText(["salesManagerRoleLabel"])
                    : translateText(["managerRoleLabel"])
                }
                name="isManager"
                checked={values.isManager}
                onChange={() => setFieldValue("isManager", !values.isManager)}
              />
            )}
            {restrictableRoles.includes("isEmployee") && (
              <Checkbox
                label={translateText(["salesRepresentativeRoleLabel"])}
                name="isEmployee"
                checked={values.isEmployee}
                onChange={() => setFieldValue("isEmployee", !values.isEmployee)}
              />
            )}
            {restrictableRoles.includes("isSender") && (
              <Checkbox
                label={translateText(["senderRoleLabel"])}
                name="isSender"
                checked={values.isSender}
                onChange={() => setFieldValue("isSender", !values.isSender)}
              />
            )}
          </Stack>
          <div className="flex flex-row justify-end gap-3 mt-4">
            <ButtonV2
              variant={"tertiary"}
              onClick={handleCancelBtnClick}
              icon={<Icon name={IconName.CLOSE_ICON} />}
              iconPosition="end"
            >
              {translateText(["cancelBtnText"])}
            </ButtonV2>
            <ButtonV2
              variant={"primary"}
              onClick={handleSubmit}
              disabled={!dirty}
              icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
              iconPosition="end"
            >
              {translateText(["saveBtnText"])}
            </ButtonV2>
          </div>
        </Stack>
      }
    />
  );
};

export default RestrictedUserRolesModal;
