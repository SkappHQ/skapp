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
  employeeName: string;
  actionType: "terminate" | "delete";
  onActionSuccess: () => void;
}

const SupervisorReassignmentModal: FC<Props> = ({
  isOpen,
  onCancel,
  employeeId,
  employeeName,
  actionType,
  onActionSuccess
}) => {
  const translateText = useTranslator("peopleModule", "supervisorReassignment");
  const { setToastMessage } = useToast();
  const router = useRouter();

  const [primaryAssignments, setPrimaryAssignments] = useState<
    Record<number, string | number>
  >({});
  const [teamAssignments, setTeamAssignments] = useState<
    Record<number, string | number>
  >({});
  const [hasAttemptedProceed, setHasAttemptedProceed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPrimaryAssignments({});
      setTeamAssignments({});
      setHasAttemptedProceed(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const { data: supervisorRoles } = useGetSupervisorRoles(employeeId, isOpen);
  const { data: activeEmployees = [], isLoading: isLoadingEmployees } =
    useGetActiveEmployeesForReassignment(isOpen);

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

  const noActiveEmployeesAvailable =
    !isLoadingEmployees && employeeDropdownOptions.length === 0;

  const allPrimaryAssigned = supervisedEmployees.every(
    (emp) => !!primaryAssignments[emp.employeeId]
  );

  const allTeamAssigned = supervisedTeams.every(
    (team) => !!teamAssignments[team.teamId]
  );

  const isProceedEnabled =
    allPrimaryAssigned && allTeamAssigned && !noActiveEmployeesAvailable;

  const onTransferSuccess = () => {
    if (actionType === "terminate") {
      terminateEmployee();
    } else {
      deleteEmployee();
    }
  };

  const onTerminateSuccess = () => {
    setIsSubmitting(false);
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["terminateSuccessTitle"]),
      description: translateText(["terminateSuccessDescription"], {
        name: employeeName
      }),
      isIcon: true
    });
    onActionSuccess();
  };

  const onDeleteSuccess = () => {
    setIsSubmitting(false);
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["deleteSuccessTitle"]),
      description: translateText(["deleteSuccessDescription"], {
        name: employeeName
      }),
      isIcon: true
    });
    router.push(ROUTES.PEOPLE.DIRECTORY);
    onActionSuccess();
  };

  const onActionError = () => {
    setIsSubmitting(false);
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["actionErrorTitle"]),
      description: translateText(["actionErrorDescription"]),
      isIcon: true
    });
  };

  const { mutate: transferSupervisors } = useTransferSupervisors(
    employeeId,
    onTransferSuccess,
    onActionError
  );
  const { mutate: terminateEmployee } = useTerminateUser(
    onTerminateSuccess,
    onActionError
  );
  const { mutate: deleteEmployee } = useDeleteUser(
    onDeleteSuccess,
    onActionError
  );

  const handleProceed = () => {
    setIsSubmitting(true);
    const payload: TransferSupervisorsPayload = {
      primarySupervisors: supervisedEmployees
        .filter((emp) => !!primaryAssignments[emp.employeeId])
        .map((emp) => ({
          employeeId: emp.employeeId,
          newPrimarySupervisorId: Number(primaryAssignments[emp.employeeId])
        })),
      teamSupervisors: supervisedTeams
        .filter((team) => !!teamAssignments[team.teamId])
        .map((team) => ({
          teamId: team.teamId,
          newTeamSupervisorId: Number(teamAssignments[team.teamId])
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
                          noActiveEmployeesAvailable
                            ? "noActiveEmployeesPlaceholder"
                            : "selectSupervisorPlaceholder"
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
                          noActiveEmployeesAvailable
                            ? "noActiveEmployeesPlaceholder"
                            : "selectSupervisorPlaceholder"
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
        <ButtonV2 variant="tertiary" onClick={onCancel} disabled={isSubmitting}>
          {translateText(["cancelButton"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          onClick={() => {
            if (!isProceedEnabled) {
              if (!noActiveEmployeesAvailable) {
                setHasAttemptedProceed(true);
              }
              return;
            }
            handleProceed();
          }}
          disabled={isSubmitting}
        >
          {proceedButtonLabel}
        </ButtonV2>
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
      closeButtonAriaLabel={translateText(["closeModalAriaLabel"])}
    />
  );
};

export default SupervisorReassignmentModal;
