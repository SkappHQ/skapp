import { Box, Stack, Typography } from "@mui/material";
import { ButtonV2, SmallModal } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";

import Checkbox from "~community/common/components/atoms/Checkbox/Checkbox";
import Icon from "~community/common/components/atoms/Icon/Icon";
import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import { Modules, RoleLevel } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { useUpdateUserRoleRestrictions } from "~community/configurations/api/userRolesApi";
import { useConfigurationStore } from "~community/configurations/stores/configurationStore";
import {
  UserRoleRestrictionsType,
  UserRoleRestrictionsUpdateType
} from "~community/configurations/types/UserRolesTypes";
import {
  hasSelectionChanged,
  toggleRoleLevel
} from "~community/configurations/utils/userRoles/roleRestrictionUtils";

import styles from "./styles";

const ROLE_LEVEL_LABEL_KEYS: Record<RoleLevel, string> = {
  [RoleLevel.ADMIN]: "adminRoleLabel",
  [RoleLevel.MANAGER]: "managerRoleLabel",
  [RoleLevel.SENDER]: "senderRoleLabel",
  [RoleLevel.SALES_MANAGER]: "salesManagerRoleLabel",
  [RoleLevel.EMPLOYEE]: "employeeRoleLabel",
  [RoleLevel.GUEST]: "guestRoleLabel",
  [RoleLevel.NONE]: "noneRoleLabel",
  [RoleLevel.SALES_REPRESENTATIVE]: "salesRepresentativeRoleLabel"
};

/** Role levels the backend reports through the deprecated isManager flag, and will be removed in the future */
const SECONDARY_ROLE_LEVELS = new Set<RoleLevel>([
  RoleLevel.MANAGER,
  RoleLevel.SENDER,
  RoleLevel.SALES_MANAGER
]);

interface Props {
  initialData: UserRoleRestrictionsType;
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

  // This endpoint still accepts only the isAdmin/isManager pair, where
  // isManager stands for whichever manager level role the module has. Replaced
  // by an add/remove delta payload in the next phase.
  const handleSubmit = () => {
    const payload: UserRoleRestrictionsUpdateType = {
      module: moduleType,
      isAdmin: values.selected.includes(RoleLevel.ADMIN),
      isManager: values.selected.some((roleLevel) =>
        SECONDARY_ROLE_LEVELS.has(roleLevel)
      )
    };

    updateUserRoleRestrictions(payload);
  };

  const { values, setFieldValue, resetForm } = useFormik<{
    selected: RoleLevel[];
  }>({
    initialValues: {
      selected: initialData.restrictions
    },
    enableReinitialize: true,
    onSubmit: handleSubmit
  });

  const restrictableRoles = initialData.restrictableRoles;

  const isSelectionChanged = hasSelectionChanged(
    values.selected,
    initialData.restrictions
  );

  const onRoleLevelChange = (roleLevel: RoleLevel) => {
    setFieldValue("selected", toggleRoleLevel(values.selected, roleLevel));
  };

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
            {restrictableRoles.map((roleLevel) => (
              <Checkbox
                key={roleLevel}
                label={translateText([ROLE_LEVEL_LABEL_KEYS[roleLevel]])}
                name={roleLevel}
                checked={values.selected.includes(roleLevel)}
                onChange={() => onRoleLevelChange(roleLevel)}
              />
            ))}
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
              disabled={!isSelectionChanged}
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
