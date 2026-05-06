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
  const [hasAttemptedProceed, setHasAttemptedProceed] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPrimaryAssignments({});
      setTeamAssignments({});
      setHasAttemptedProceed(false);
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
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-4">
        <p className="body1">{translateText(["subtitle"])}</p>

        <div className="flex flex-col max-h-88 overflow-y-auto gap-4">
          {supervisedEmployees.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="subtitle2">
                {translateText(["primarySupervisorsSection"])}
              </p>
              <div className="flex flex-col gap-3">
                {supervisedEmployees.map((emp) => (
                  <div
                    key={emp.employeeId}
                    className="flex flex-row items-center justify-between gap-3 min-h-10.25"
                  >
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <AvatarChip
                        firstName={emp.firstName}
                        lastName={emp.lastName}
                        avatarUrl={emp.authPic}
                        chipStyles={{ justifyContent: "flex-start" }}
                      />
                    </div>
                    <div className="w-62.5 shrink-0">
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
                          setPrimaryAssignments((prev) => ({
                            ...prev,
                            [emp.employeeId]: val as string | number
                          }));
                        }}
                        componentStyle={{ mt: "0" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {supervisedTeams.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="subtitle2">
                {translateText(["teamSupervisorsSection"])}
              </p>
              <div className="flex flex-col gap-3">
                {supervisedTeams.map((team) => (
                  <div
                    key={team.teamId}
                    className="flex flex-row items-center justify-between min-h-10.25"
                  >
                    <div className="w-31.25 overflow-hidden shrink-0">
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
                    </div>
                    <div className="w-62.5 shrink-0">
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
                          setTeamAssignments((prev) => ({
                            ...prev,
                            [team.teamId]: val as string | number
                          }));
                        }}
                        componentStyle={{ mt: "0" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {noActiveEmployeesAvailable && (
            <p
              className="body2"
              style={{ color: "var(--color-semantic-red-text)" }}
            >
              {translateText(["noActiveEmployeesMessage"])}
            </p>
          )}

          {hasAttemptedProceed &&
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
        </div>
      </div>

      <div className="flex flex-row gap-4 justify-end">
        <ButtonV2 variant="tertiary" onClick={onCancel}>
          {translateText(["cancelButton"])}
        </ButtonV2>
        <div
          onClick={() => {
            if (!isProceedEnabled && !noActiveEmployeesAvailable) {
              setHasAttemptedProceed(true);
            }
          }}
        >
          <ButtonV2
            variant="primary"
            onClick={handleProceed}
            disabled={!isProceedEnabled || isPending}
          >
            {proceedButtonLabel}
          </ButtonV2>
        </div>
      </div>
    </div>
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
