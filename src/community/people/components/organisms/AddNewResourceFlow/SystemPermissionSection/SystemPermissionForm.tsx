import { Stack, Typography } from "@mui/material";
import { useFormik } from "formik";
import { Dispatch, JSX, SetStateAction, useEffect, useState } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import Icon from "~community/common/components/atoms/Icon/Icon";
import SwitchRow from "~community/common/components/atoms/SwitchRow/SwitchRow";
import DropdownList from "~community/common/components/molecules/DropdownList/DropdownList";
import Modal from "~community/common/components/organisms/Modal/Modal";
import PeopleLayout from "~community/common/components/templates/PeopleLayout/PeopleLayout";
import { systemPermissionFormTestId } from "~community/common/constants/testIds";
import { ButtonStyle, ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { theme } from "~community/common/theme/theme";
import { IconName } from "~community/common/types/IconTypes";
import {
  useGetAllowedGrantablePermissions,
  useGetSuperAdminCount
} from "~community/configurations/api/userRolesApi";
import { MAX_SUPERVISOR_LIMIT } from "~community/people/constants/configs";
import { usePeopleStore } from "~community/people/store/store";
import { SystemPermissionInitalStateType } from "~community/people/types/AddNewResourceTypes";
import { EditAllInformationFormStatus } from "~community/people/types/EditEmployeeInfoTypes";
import {
  EmployeeDetails,
  EmployeeRoleType,
  Role,
  TeamResultsType
} from "~community/people/types/EmployeeTypes";
import { isDemoteUser } from "~community/people/utils/PeopleDirectoryUtils";
import { ProfileModes } from "~enterprise/common/enums/CommonEum";
import { useGetEnviornment } from "~enterprise/common/hooks/useGetEnviornment";

import SystemCredentials from "../../SystemCredentials/SystemCrendetials";
import styles from "./styles";

interface Props {
  onNext: () => void;
  onSave: () => void;
  onBack: () => void;
  isLoading: boolean;
  isSuccess: boolean;
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
  isUpdate = false,
  isSubmitDisabled = false,
  isProfileView = false,
  updateEmployeeStatus,
  setUpdateEmployeeStatus,
  isLoading,
  employee,
  isInputsDisabled = false
}: Props): JSX.Element => {
  const classes = styles();
  const [openModal, setOpenModal] = useState(false);
  const [modalDescription, setModalDescription] = useState("");
  const enviornment = useGetEnviornment();
  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "systemPermissions"
  );

  const translateTexts = useTranslator(
    "peopleModule",
    "addResource",
    "commonText"
  );

  const { data } = useGetSuperAdminCount();
  const { setUserRoles, userRoles } = usePeopleStore((state) => state);
  const { setToastMessage } = useToast();
  const initialValues: SystemPermissionInitalStateType = {
    isSuperAdmin: userRoles.isSuperAdmin || false,
    peopleRole: userRoles.peopleRole || Role.PEOPLE_EMPLOYEE,
    leaveRole: userRoles.leaveRole || Role.LEAVE_EMPLOYEE,
    attendanceRole: userRoles.attendanceRole || Role.ATTENDANCE_EMPLOYEE
  };

  const { data: grantablePermission } = useGetAllowedGrantablePermissions();

  const onSubmit = (values: EmployeeRoleType) => {
    setUserRoles("isSuperAdmin", values.isSuperAdmin);
    setUserRoles("attendanceRole", values.attendanceRole);
    setUserRoles("peopleRole", values.peopleRole);
    setUserRoles("leaveRole", values.leaveRole);
  };
  const formik = useFormik({
    initialValues,
    onSubmit,
    validateOnChange: false
  });

  const { values, setFieldValue } = formik;

  useEffect(() => {
    if (updateEmployeeStatus === EditAllInformationFormStatus.TRIGGERED) {
      void handleNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateEmployeeStatus]);

  const isSupervisingTeams = (): boolean => {
    const teams = employee?.teams as TeamResultsType[];
    return (
      teams.some((team: TeamResultsType) => team?.team?.isSupervisor) ?? false
    );
  };

  const isSupervisingEmployees = (): boolean => {
    if (employee?.managers) return employee?.managers?.length > 0;
    else return false;
  };

  const handleNext = async () => {
    if (isUpdate) {
      if (
        isDemoteUser(employee, values) &&
        (isSupervisingTeams() || isSupervisingEmployees())
      ) {
        if (isSupervisingEmployees())
          setModalDescription(translateText(["demoteUserSupervisingEmployee"]));
        else setModalDescription(translateText(["demoteUserSupervisingTeams"]));

        setOpenModal(true);
      } else {
        if (
          employee &&
          !employee?.userRoles?.isSuperAdmin &&
          values.isSuperAdmin &&
          data &&
          data >= MAX_SUPERVISOR_LIMIT
        ) {
          setToastMessage({
            toastType: ToastType.ERROR,
            title: translateText(["maxSupervisorCountReached"]),
            description: translateText([
              "maxSupervisorCountReachedDescription"
            ]),
            open: true
          });
        } else {
          setUpdateEmployeeStatus?.(EditAllInformationFormStatus.VALIDATED);
          onNext();
        }
      }
    } else {
      if (values.isSuperAdmin && data && data >= MAX_SUPERVISOR_LIMIT) {
        setToastMessage({
          toastType: ToastType.ERROR,
          title: translateText(["maxSupervisorCountReached"]),
          open: true
        });
      } else {
        setUpdateEmployeeStatus?.(EditAllInformationFormStatus.VALIDATED);
        onNext();
      }
    }
  };

  const handleCustomChange = (name: string, value: any) => {
    setFieldValue(name, value);

    if (name === "isSuperAdmin") {
      setUserRoles("isSuperAdmin", value);
    } else if (name === "peopleRole") {
      setUserRoles("peopleRole", value);
    } else if (name === "leaveRole") {
      setUserRoles("leaveRole", value);
    } else if (name === "attendanceRole") {
      setUserRoles("attendanceRole", value);
    }
  };

  const handleModalClose = () => {
    if (employee) {
      const roles = [
        "isSuperAdmin",
        "peopleRole",
        "leaveRole",
        "attendanceRole"
      ] as const;

      roles.forEach((role) => {
        setUserRoles(role, employee.userRoles[role]);
        void setFieldValue(role, employee.userRoles[role]);
      });
    }

    setModalDescription("");
    setOpenModal(false);
  };
  return (
    <PeopleLayout
      title={translateText(["title"])}
      containerStyles={classes.layoutContainerStyles}
      dividerStyles={classes.layoutDividerStyles}
      pageHead={translateText(["head"])}
    >
      <>
        <Stack direction={"row"} gap={6} marginTop={2}>
          <Stack direction={"row"} gap={6} width={"auto"}>
            <Typography
              sx={{
                color: isInputsDisabled
                  ? theme.palette.text.disabled
                  : "inherit"
              }}
            >
              {translateText(["superAdmin"])}
            </Typography>
            {!isInputsDisabled && <Icon name={IconName.SUPER_ADMIN_ICON} />}
          </Stack>
          <Stack>
            <SwitchRow
              disabled={isProfileView || isInputsDisabled}
              checked={values.isSuperAdmin}
              onChange={(e) => {
                const isChecked = e.target.checked;
                void setFieldValue("isSuperAdmin", isChecked);
                setUserRoles("isSuperAdmin", isChecked);

                const peopleRole = isChecked
                  ? Role.PEOPLE_ADMIN
                  : Role.PEOPLE_EMPLOYEE;
                const leaveRole = isChecked
                  ? Role.LEAVE_ADMIN
                  : Role.LEAVE_EMPLOYEE;
                const attendanceRole = isChecked
                  ? Role.ATTENDANCE_ADMIN
                  : Role.ATTENDANCE_EMPLOYEE;

                void setFieldValue("peopleRole", peopleRole);
                void setFieldValue("leaveRole", leaveRole);
                void setFieldValue("attendanceRole", attendanceRole);

                setUserRoles("isSuperAdmin", isChecked);
                setUserRoles("attendanceRole", attendanceRole);
                setUserRoles("peopleRole", peopleRole);
                setUserRoles("leaveRole", leaveRole);
              }}
            />
          </Stack>
        </Stack>

        <Stack direction={"row"} gap={4} marginTop={5}>
          <DropdownList
            inputName={"peopleRole"}
            label="People"
            itemList={grantablePermission?.people || []}
            value={values.peopleRole}
            componentStyle={{
              flex: 1
            }}
            checkSelected
            onChange={(e) => handleCustomChange("peopleRole", e.target.value)}
            isDisabled={
              isProfileView || values.isSuperAdmin || isInputsDisabled
            }
          />
          <DropdownList
            inputName={"leaveRole"}
            label="Leave"
            itemList={grantablePermission?.leave || []}
            value={values.leaveRole}
            checkSelected
            componentStyle={{
              flex: 1
            }}
            onChange={(e) => handleCustomChange("leaveRole", e.target.value)}
            isDisabled={
              isProfileView || values.isSuperAdmin || isInputsDisabled
            }
          />
          <DropdownList
            inputName={"attendanceRole"}
            label="Attendance"
            itemList={grantablePermission?.attendance || []}
            value={values.attendanceRole}
            componentStyle={{
              flex: 1
            }}
            checkSelected
            onChange={(e) =>
              handleCustomChange("attendanceRole", e.target.value)
            }
            isDisabled={
              isProfileView || values.isSuperAdmin || isInputsDisabled
            }
          />
        </Stack>
        {isUpdate &&
          !isInputsDisabled &&
          enviornment === ProfileModes.COMMUNITY && <SystemCredentials />}

        {!isInputsDisabled && (
          <Stack
            direction="row"
            justifyContent="flex-start"
            spacing={2}
            marginTop={10}
            sx={{ padding: "1rem 0" }}
          >
            <Button
              label={
                isUpdate ? translateTexts(["cancel"]) : translateTexts(["back"])
              }
              buttonStyle={ButtonStyle.TERTIARY}
              startIcon={
                isUpdate ? IconName.CLOSE_ICON : IconName.LEFT_ARROW_ICON
              }
              isFullWidth={false}
              onClick={onBack}
              styles={{
                padding: "1.25rem 1.75rem"
              }}
              disabled={isSubmitDisabled || isLoading || isInputsDisabled}
              dataTestId={
                isUpdate
                  ? systemPermissionFormTestId.buttons.cancelBtn
                  : systemPermissionFormTestId.buttons.backBtn
              }
            />
            <Button
              label={
                isUpdate
                  ? translateTexts(["saveDetails"])
                  : translateTexts(["next"])
              }
              buttonStyle={ButtonStyle.PRIMARY}
              endIcon={
                isUpdate ? IconName.SAVE_ICON : IconName.RIGHT_ARROW_ICON
              }
              isFullWidth={false}
              onClick={handleNext}
              styles={{ padding: "1.25rem 2.5rem" }}
              disabled={isSubmitDisabled || isLoading || isInputsDisabled}
              isLoading={isLoading}
              dataTestId={
                isUpdate
                  ? systemPermissionFormTestId.buttons.saveDetailsBtn
                  : systemPermissionFormTestId.buttons.nextBtn
              }
            />
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
          <Stack
            sx={{
              gap: 2,
              marginTop: 2
            }}
          >
            <Typography>{modalDescription}</Typography>

            <Button
              buttonStyle={ButtonStyle.PRIMARY}
              label={"Okay"}
              onClick={handleModalClose}
            />
          </Stack>
        </Modal>
      </>
    </PeopleLayout>
  );
};

export default SystemPermissionForm;
