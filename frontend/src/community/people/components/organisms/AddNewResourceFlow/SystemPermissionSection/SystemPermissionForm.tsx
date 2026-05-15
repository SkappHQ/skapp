import { Stack, Typography } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { Dispatch, JSX, SetStateAction, useEffect, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import SwitchRow from "~community/common/components/atoms/SwitchRow/SwitchRow";
import DropdownList from "~community/common/components/molecules/DropdownList/DropdownList";
import Modal from "~community/common/components/organisms/Modal/Modal";
import PeopleLayout from "~community/common/components/templates/PeopleLayout/PeopleLayout";
import { appModes } from "~community/common/constants/configs";
import { systemPermissionFormTestId } from "~community/common/constants/testIds";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import {
  useGetAllowedGrantablePermissions,
  useGetSuperAdminCount
} from "~community/configurations/api/userRolesApi";
import SystemCredentials from "~community/people/components/organisms/SystemCredentials/SystemCredentials";
import { usePeopleStore } from "~community/people/store/store";
import { SystemPermissionInitialStateType } from "~community/people/types/AddNewResourceTypes";
import { EditAllInformationFormStatus } from "~community/people/types/EditEmployeeInfoTypes";
import {
  EmployeeDetails,
  EmployeeRoleType,
  Role
} from "~community/people/types/EmployeeTypes";
import { handleAddNewResourceSuccess } from "~community/people/utils/directoryUtils/addNewResourceFlowUtils/addNewResourceUtils";
import {
  handleCustomChangeDefault,
  handleCustomChangeEnterprise,
  handleModalClose,
  handleNextBtnClick,
  handleSuperAdminChangeDefault,
  handleSuperAdminChangeEnterprise,
  handleSystemPermissionFormSubmit
} from "~community/people/utils/directoryUtils/addNewResourceFlowUtils/systemPermissionFormUtils";
import { useGetEmployeeRoleLimit } from "~enterprise/common/api/peopleApi";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import { EmployeeRoleLimit } from "~enterprise/people/types/EmployeeTypes";

import styles from "./styles";

interface Props {
  onNext: () => void;
  onSave: () => void;
  onBack: () => void;
  isLoading: boolean;
  isSuccess?: boolean;
  isUpdate?: boolean;
  isSubmitDisabled?: boolean;
  isProfileView?: boolean;
  updateEmployeeStatus?: EditAllInformationFormStatus;
  setUpdateEmployeeStatus?: Dispatch<
    SetStateAction<EditAllInformationFormStatus>
  >;
  isSuperAdminEditFlow?: boolean;
  employee?: EmployeeDetails;
  isInputsDisabled?: boolean;
}

const SystemPermissionForm = ({
  onBack,
  onNext,
  onSave,
  isUpdate = false,
  isSubmitDisabled = false,
  isProfileView = false,
  updateEmployeeStatus,
  setUpdateEmployeeStatus,
  isLoading,
  employee,
  isInputsDisabled = false,
  isSuccess
}: Props): JSX.Element => {
  const classes = styles();

  const router = useRouter();

  const environment = useGetEnvironment();

  const { data: superAdminCount } = useGetSuperAdminCount();
  const { data: grantablePermission } = useGetAllowedGrantablePermissions();

  const {
    isAttendanceModuleEnabled,
    isLeaveModuleEnabled,
    isEsignatureModuleEnabled,
    isPmModuleEnabled,
    // isCrmModuleEnabled
  } = useSessionData();

  const { setToastMessage } = useToast();

  const systemPermissionsText = useTranslator(
    "peopleModule",
    "addResource",
    "systemPermissions"
  );
  const commonText = useTranslator("peopleModule", "addResource", "commonText");
  const roleLimitationText = useTranslator("peopleModule", "roleLimitation");

  const { setUserRoles, userRoles, resetEmployeeData } = usePeopleStore(
    (state) => ({
      setUserRoles: state.setUserRoles,
      userRoles: state.userRoles,
      resetEmployeeData: state.resetEmployeeData
    })
  );

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [modalDescription, setModalDescription] = useState<string>("");
  const [roleLimits, setRoleLimits] = useState<EmployeeRoleLimit>({
    leaveAdminLimitExceeded: false,
    attendanceAdminLimitExceeded: false,
    peopleAdminLimitExceeded: false,
    leaveManagerLimitExceeded: false,
    attendanceManagerLimitExceeded: false,
    peopleManagerLimitExceeded: false,
    superAdminLimitExceeded: false,
    esignAdminLimitExceeded: false,
    esignSenderLimitExceeded: false,
    pmAdminLimitExceeded: false,
    // crmAdminLimitExceeded: false,
    // crmSalesManagerLimitExceeded: false,
    // crmSalesRepresentativeLimitExceeded: false
  });

  const initialValues: SystemPermissionInitialStateType = {
    isSuperAdmin: userRoles.isSuperAdmin || false,
    peopleRole: userRoles.peopleRole || Role.PEOPLE_EMPLOYEE,
    leaveRole: userRoles.leaveRole || Role.LEAVE_EMPLOYEE,
    attendanceRole: userRoles.attendanceRole || Role.ATTENDANCE_EMPLOYEE,
    esignRole: userRoles.esignRole || Role.ESIGN_EMPLOYEE,
    pmRole: userRoles.pmRole || Role.PM_EMPLOYEE,
    // crmRole: userRoles.crmRole || Role.CRM_NONE
  };

  const { values, setFieldValue } = useFormik({
    initialValues,
    onSubmit: (values: EmployeeRoleType) =>
      handleSystemPermissionFormSubmit({ values, setUserRoles }),
    validateOnChange: false
  });

  const { mutate: checkRoleLimits } = useGetEmployeeRoleLimit(
    (response) => setRoleLimits(response),
    () => {
      router.push("/_error");
    }
  );

  useEffect(() => {
    if (environment === appModes.ENTERPRISE) {
      checkRoleLimits();
    }
  }, [environment]);

  useEffect(() => {
    if (updateEmployeeStatus === EditAllInformationFormStatus.TRIGGERED) {
      void handleNextBtnClick({
        isUpdate,
        systemPermissionsText,
        employee,
        setToastMessage,
        superAdminCount,
        setModalDescription,
        setOpenModal,
        values,
        setUpdateEmployeeStatus,
        onNext
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateEmployeeStatus]);

  useEffect(() => {
    if (isSuccess) {
      handleAddNewResourceSuccess({
        setToastMessage,
        resetEmployeeData,
        router,
        translateText: commonText
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  const handlePrimaryBtnClick = () => {
    if (isLeaveModuleEnabled) {
      handleNextBtnClick({
        isUpdate,
        systemPermissionsText,
        employee,
        setToastMessage,
        superAdminCount,
        setModalDescription,
        setOpenModal,
        values,
        setUpdateEmployeeStatus,
        onNext
      });
    } else {
      onSave();
    }
  };

  const handleCustomChange = ({
    name,
    value
  }: {
    name: keyof EmployeeRoleType;
    value: any;
  }) => {
    environment === appModes.ENTERPRISE
      ? handleCustomChangeEnterprise({
          name,
          value,
          setToastMessage,
          roleLimitationText,
          roleLimits,
          setFieldValue,
          setUserRoles
        })
      : handleCustomChangeDefault({
          name,
          value,
          setFieldValue,
          setUserRoles
        });
  };

  const handleSuperAdminChange = (checked: boolean) => {
    if (environment === appModes.ENTERPRISE) {
      handleSuperAdminChangeEnterprise({
        checked,
        setFieldValue,
        setUserRoles,
        setToastMessage,
        roleLimitationText,
        roleLimits,
        superAdminCount
      });
    } else {
      handleSuperAdminChangeDefault({
        checked,
        setFieldValue,
        setUserRoles,
        setToastMessage,
        roleLimitationText,
        superAdminCount
      });
    }
  };

  return (
    <PeopleLayout
      title={systemPermissionsText(["title"])}
      pageHead={systemPermissionsText(["head"])}
      containerStyles={classes.layoutContainerStyles}
      dividerStyles={classes.layoutDividerStyles}
    >
      <>
        <SwitchRow
          labelId="super-admin"
          label={systemPermissionsText(["superAdmin"])}
          disabled={isProfileView || isInputsDisabled}
          checked={values.isSuperAdmin}
          onChange={(checked: boolean) => handleSuperAdminChange(checked)}
          wrapperStyles={classes.switchRowWrapper}
          icon={!isInputsDisabled ? IconName.SUPER_ADMIN_ICON : undefined}
        />

        <Stack sx={classes.dropdownContainer}>
          <DropdownList
            inputName={"peopleRole"}
            label="People"
            itemList={grantablePermission?.people || []}
            value={values.peopleRole}
            componentStyle={classes.dropdownListComponentStyles}
            checkSelected
            onChange={(event) =>
              handleCustomChange({
                name: "peopleRole",
                value: event.target.value
              })
            }
            isDisabled={
              isProfileView || values.isSuperAdmin || isInputsDisabled
            }
          />

          {isLeaveModuleEnabled && (
            <DropdownList
              inputName={"leaveRole"}
              label="Leave"
              itemList={grantablePermission?.leave || []}
              value={values.leaveRole}
              checkSelected
              componentStyle={classes.dropdownListComponentStyles}
              onChange={(event) =>
                handleCustomChange({
                  name: "leaveRole",
                  value: event.target.value
                })
              }
              isDisabled={
                isProfileView || values.isSuperAdmin || isInputsDisabled
              }
            />
          )}

          {isAttendanceModuleEnabled && (
            <DropdownList
              inputName={"attendanceRole"}
              label="Attendance"
              itemList={grantablePermission?.attendance || []}
              value={values.attendanceRole}
              componentStyle={classes.dropdownListComponentStyles}
              checkSelected
              onChange={(event) =>
                handleCustomChange({
                  name: "attendanceRole",
                  value: event.target.value
                })
              }
              isDisabled={
                isProfileView || values.isSuperAdmin || isInputsDisabled
              }
            />
          )}

          {isEsignatureModuleEnabled && (
            <DropdownList
              inputName={"esignRole"}
              label="e-signature"
              itemList={grantablePermission?.esign || []}
              value={values.esignRole}
              componentStyle={classes.dropdownListComponentStyles}
              checkSelected
              onChange={(event) =>
                handleCustomChange({
                  name: "esignRole",
                  value: event.target.value
                })
              }
              isDisabled={
                isProfileView || values.isSuperAdmin || isInputsDisabled
              }
            />
          )}

          {isPmModuleEnabled && (
            <DropdownList
              inputName={"pmRole"}
              label={systemPermissionsText(["projectManagement"])}
              itemList={grantablePermission?.pm || []}
              value={values.pmRole}
              componentStyle={classes.dropdownListComponentStyles}
              checkSelected
              onChange={(event) =>
                handleCustomChange({
                  name: "pmRole",
                  value: event.target.value
                })
              }
              isDisabled={
                isProfileView || values.isSuperAdmin || isInputsDisabled
              }
            />
          )}

          {/* {isCrmModuleEnabled && (
            <DropdownList
              inputName={"crmRole"}
              label={systemPermissionsText(["crm"])}
              itemList={grantablePermission?.crm || []}
              value={values.crmRole}
              componentStyle={classes.dropdownListComponentStyles}
              checkSelected
              onChange={(event) =>
                handleCustomChange({
                  name: "crmRole",
                  value: event.target.value
                })
              }
              isDisabled={
                isProfileView || values.isSuperAdmin || isInputsDisabled
              }
            />
          )} */}
        </Stack>

        {isUpdate &&
          !isInputsDisabled &&
          environment === appModes.COMMUNITY && <SystemCredentials />}

        {!isInputsDisabled && (
          <Stack sx={classes.btnWrapper}>
            <ButtonV2
              disabled={isSubmitDisabled || isLoading || isInputsDisabled}
              variant={"tertiary"}
              size={"lg"}
              onClick={onBack}
              data-testid={
                isUpdate
                  ? systemPermissionFormTestId.buttons.cancelBtn
                  : systemPermissionFormTestId.buttons.backBtn
              }
              icon={
                isUpdate ? (
                  <Icon name={IconName.CLOSE_ICON} />
                ) : (
                  <Icon name={IconName.LEFT_ARROW_ICON} />
                )
              }
              iconPosition={isUpdate ? "end" : "start"}
            >
              {isUpdate ? commonText(["cancel"]) : commonText(["back"])}
            </ButtonV2>
            <ButtonV2
              isLoading={isLoading}
              disabled={isSubmitDisabled || isLoading || isInputsDisabled}
              variant={"primary"}
              size={"lg"}
              onClick={handlePrimaryBtnClick}
              data-testid={
                !isLeaveModuleEnabled || isUpdate
                  ? systemPermissionFormTestId.buttons.saveDetailsBtn
                  : systemPermissionFormTestId.buttons.nextBtn
              }
              icon={
                !isLeaveModuleEnabled || isUpdate ? (
                  <Icon name={IconName.SAVE_ICON} />
                ) : (
                  <Icon name={IconName.RIGHT_ARROW_ICON} />
                )
              }
              iconPosition="end"
            >
              {!isLeaveModuleEnabled || isUpdate
                ? commonText(["saveDetails"])
                : commonText(["next"])}
            </ButtonV2>
          </Stack>
        )}

        <Modal
          isModalOpen={openModal}
          title="Alert"
          onCloseModal={() => {
            setOpenModal(false);
            setModalDescription("");
          }}
        >
          <Stack sx={classes.modalContainer}>
            <Typography>{modalDescription}</Typography>
            <ButtonV2
              variant={"primary"}
              onClick={() =>
                handleModalClose({
                  employee,
                  setUserRoles,
                  setFieldValue,
                  setModalDescription,
                  setOpenModal
                })
              }
            >
              {commonText(["okay"])}
            </ButtonV2>
          </Stack>
        </Modal>
      </>
    </PeopleLayout>
  );
};

export default SystemPermissionForm;
