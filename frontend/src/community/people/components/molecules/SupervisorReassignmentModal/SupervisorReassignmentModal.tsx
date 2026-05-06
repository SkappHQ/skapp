import { Box, Stack } from "@mui/material";
import { ButtonV2, SmallModal } from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/router";
import { FC, useEffect, useMemo, useState } from "react";

import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import DropdownSearch from "~community/common/components/molecules/DropDownSearch/DropDownSearch";
import ROUTES from "~community/common/constants/routes";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { DropdownListType } from "~community/common/types/CommonTypes";
import {
  useDeleteUser,
  useGetActiveEmployeesForReassignment,
  useGetSupervisorRoles,
  useTerminateUser,
  useTransferSupervisors
} from "~community/people/api/PeopleApi";
import {
  SupervisedEmployee,
  SupervisedTeam,
  TransferSupervisorsPayload
} from "~community/people/types/PeopleTypes";

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  employeeId: number;
  actionType: "terminate" | "delete";
  onActionSuccess: () => void;
}

const SupervisorReassignmentModal: FC<Props> = ({
  isOpen,
  onCancel,
  employeeId,
  actionType,
  onActionSuccess
}) => {
  const translateText = useTranslator("peopleModule", "supervisorReassignment");
  const terminationText = useTranslator("peopleModule", "termination");
  const deletionText = useTranslator("peopleModule", "deletion");
  const { setToastMessage } = useToast();
  const router = useRouter();

  const [primaryAssignments, setPrimaryAssignments] = useState<
    Record<number, string | number>
  >({});
  const [teamAssignments, setTeamAssignments] = useState<
    Record<number, string | number>
  >({});
  const [hasTouched, setHasTouched] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPrimaryAssignments({});
      setTeamAssignments({});
      setHasTouched(false);
    }
  }, [isOpen]);

  const { data: supervisorRoles } = useGetSupervisorRoles(
    isOpen ? employeeId : 0
  );
  const { data: activeEmployees = [] } = useGetActiveEmployeesForReassignment();

  const supervisedEmployees: SupervisedEmployee[] =
    supervisorRoles?.supervisedEmployees ?? [];
  const supervisedTeams: SupervisedTeam[] =
    supervisorRoles?.supervisedTeams ?? [];

  const employeeDropdownOptions: DropdownListType[] = useMemo(() => {
    return activeEmployees
      .filter((emp) => Number(emp.employeeId) !== employeeId)
      .map((emp) => ({
        label: `${emp.firstName} ${emp.lastName}`,
        value: emp.employeeId
      }));
  }, [activeEmployees, employeeId]);

  const noActiveEmployeesAvailable = employeeDropdownOptions.length === 0;

  const allPrimaryAssigned =
    supervisedEmployees.length === 0 ||
    supervisedEmployees.every((emp) => !!primaryAssignments[emp.employeeId]);

  const allTeamAssigned =
    supervisedTeams.length === 0 ||
    supervisedTeams.every((team) => !!teamAssignments[team.teamId]);

  const isProceedEnabled =
    allPrimaryAssigned && allTeamAssigned && !noActiveEmployeesAvailable;

  const onTerminateSuccess = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: terminationText(["terminateSuccessTitle"]),
      description: terminationText(["terminateSuccessDescription"]),
      isIcon: true
    });
    onActionSuccess();
  };

  const onTerminateError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: terminationText(["terminateErrorTitle"]),
      description: terminationText(["terminateErrorDescription"]),
      isIcon: true
    });
  };

  const onDeleteSuccess = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: deletionText(["deleteSuccessTitle"]),
      description: deletionText(["deleteSuccessDescription"]),
      isIcon: true
    });
    router.push(ROUTES.PEOPLE.DIRECTORY);
    onActionSuccess();
  };

  const onDeleteError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: deletionText(["deleteErrorTitle"]),
      description: deletionText(["deleteErrorDescription"]),
      isIcon: true
    });
  };

  const { mutate: terminateEmployee } = useTerminateUser(
    onTerminateSuccess,
    onTerminateError
  );
  const { mutate: deleteEmployee } = useDeleteUser(
    onDeleteSuccess,
    onDeleteError
  );

  const onTransferSuccess = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["transferSuccessTitle"]),
      isIcon: true
    });
    if (actionType === "terminate") {
      terminateEmployee();
    } else {
      deleteEmployee();
    }
  };

  const onTransferError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["transferErrorTitle"]),
      description: translateText(["transferErrorDescription"]),
      isIcon: true
    });
  };

  const { mutate: transferSupervisors, isPending } = useTransferSupervisors(
    employeeId,
    onTransferSuccess,
    onTransferError
  );

  const handleProceed = () => {
    const payload: TransferSupervisorsPayload = {
      primarySupervisors: supervisedEmployees
        .filter((emp) => !!primaryAssignments[emp.employeeId])
        .map((emp) => ({
          subordinateEmployeeId: emp.employeeId,
          newSupervisorId: Number(primaryAssignments[emp.employeeId])
        })),
      teamSupervisors: supervisedTeams
        .filter((team) => !!teamAssignments[team.teamId])
        .map((team) => ({
          teamId: team.teamId,
          newSupervisorId: Number(teamAssignments[team.teamId])
        }))
    };
    transferSupervisors(payload);
  };

  const proceedButtonLabel =
    actionType === "terminate"
      ? translateText(["proceedAndTerminateButton"])
      : translateText(["proceedAndDeleteButton"]);

  const modalContent = (
    <Stack spacing={3} sx={{ width: "100%" }}>
      {/* Frame 1 — subtitle + scrollable sections */}
      <Stack spacing={2}>
        <p className="body1">{translateText(["subtitle"])}</p>

        <Stack
          sx={{
            maxHeight: "22rem",
            overflowY: "auto",
            gap: "1rem"
          }}
        >
          {supervisedEmployees.length > 0 && (
            <Stack spacing={1.5}>
              <p className="subtitle2">
                {translateText(["primarySupervisorsSection"])}
              </p>
              <Stack spacing={1.5}>
                {supervisedEmployees.map((emp) => (
                  <Stack
                    key={emp.employeeId}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ minHeight: "2.5625rem" }}
                  >
                    <Box
                      sx={{
                        width: "7.8125rem",
                        overflow: "hidden",
                        flexShrink: 0
                      }}
                    >
                      <AvatarChip
                        firstName={emp.firstName}
                        lastName={emp.lastName}
                        avatarUrl={emp.authPic}
                      />
                    </Box>
                    <Box sx={{ width: "15.625rem", flexShrink: 0 }}>
                      <DropdownSearch
                        label=""
                        inputName={`primary-supervisor-${emp.employeeId}`}
                        value={primaryAssignments[emp.employeeId] ?? ""}
                        placeholder={translateText([
                          "selectSupervisorPlaceholder"
                        ])}
                        itemList={employeeDropdownOptions}
                        isDisabled={noActiveEmployeesAvailable}
                        onChange={(val) => {
                          setHasTouched(true);
                          setPrimaryAssignments((prev) => ({
                            ...prev,
                            [emp.employeeId]: val as string | number
                          }));
                        }}
                        componentStyle={{ mt: "0" }}
                      />
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          )}

          {supervisedTeams.length > 0 && (
            <Stack spacing={1.5}>
              <p className="subtitle2">
                {translateText(["teamSupervisorsSection"])}
              </p>
              <Stack spacing={1.5}>
                {supervisedTeams.map((team) => (
                  <Stack
                    key={team.teamId}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ minHeight: "2.5625rem" }}
                  >
                    <Box
                      sx={{
                        width: "7.8125rem",
                        overflow: "hidden",
                        flexShrink: 0
                      }}
                    >
                      <p
                        className="body2"
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {team.teamName}
                      </p>
                    </Box>
                    <Box sx={{ width: "15.625rem", flexShrink: 0 }}>
                      <DropdownSearch
                        label=""
                        inputName={`team-supervisor-${team.teamId}`}
                        value={teamAssignments[team.teamId] ?? ""}
                        placeholder={translateText([
                          "selectSupervisorPlaceholder"
                        ])}
                        itemList={employeeDropdownOptions}
                        isDisabled={noActiveEmployeesAvailable}
                        onChange={(val) => {
                          setHasTouched(true);
                          setTeamAssignments((prev) => ({
                            ...prev,
                            [team.teamId]: val as string | number
                          }));
                        }}
                        componentStyle={{ mt: "0" }}
                      />
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          )}

          {noActiveEmployeesAvailable && (
            <p
              className="body2"
              style={{ color: "var(--color-semantic-red-text)" }}
            >
              {translateText(["noActiveEmployeesMessage"])}
            </p>
          )}

          {hasTouched &&
            !isProceedEnabled &&
            !noActiveEmployeesAvailable &&
            (supervisedEmployees.length > 0 || supervisedTeams.length > 0) && (
              <p
                className="body2"
                style={{ color: "var(--color-semantic-amber-text)" }}
              >
                {translateText(["allReassignedValidationMessage"])}
              </p>
            )}
        </Stack>
      </Stack>

      <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
        <ButtonV2 variant="tertiary" onClick={onCancel}>
          {translateText(["cancelButton"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          onClick={handleProceed}
          disabled={!isProceedEnabled || isPending}
        >
          {proceedButtonLabel}
        </ButtonV2>
      </Stack>
    </Stack>
  );

  return (
    <SmallModal
      isOpen={isOpen}
      onClose={onCancel}
      modalHeader={translateText(["modalTitle"])}
      content={modalContent}
      className="w-138.25 rounded-2xl!"
    />
  );
};

export default SupervisorReassignmentModal;
