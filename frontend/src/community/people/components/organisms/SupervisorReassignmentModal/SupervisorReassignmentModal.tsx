import { ButtonV2, SmallModal } from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/router";
import { FC, useCallback, useState } from "react";

import MultipleSkeletons from "~community/common/components/molecules/Skeletons/MultipleSkeletons";
import ROUTES from "~community/common/constants/routes";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { OptionType } from "~community/common/types/CommonTypes";
import {
  useDeleteUser,
  useGetSearchedEmployees,
  useGetSupervisedEmployeesAndTeams,
  useTerminateUser,
  useTransferSupervisors
} from "~community/people/api/PeopleApi";
import SupervisorReassignmentModalSection from "~community/people/components/molecules/SupervisorReassignmentModalSection/SupervisorReassignmentModalSection";
import { usePeopleStore } from "~community/people/store/store";
import {
  SupervisorReassignmentActionType,
  TransferSupervisorsPayload
} from "~community/people/types/PeopleTypes";
import { concatStrings } from "~community/people/utils/jobFamilyUtils/commonUtils";

interface SupervisorReassignmentModalProps {
  isOpen: boolean;
  onCancel: () => void;
  employeeId: number;
  actionType: SupervisorReassignmentActionType;
  onActionSuccess: () => void;
}
const SupervisorReassignmentModal: FC<SupervisorReassignmentModalProps> = ({
  isOpen,
  onCancel,
  employeeId,
  actionType,
  onActionSuccess
}) => {
  const translateText = useTranslator("peopleModule", "supervisorReassignment");
  const { setToastMessage } = useToast();
  const router = useRouter();

  const employee = usePeopleStore((state) => state.employee);
  const employeeName = concatStrings([
    employee?.personal?.general?.firstName as string
  ]).trim();

  const [primarySupervisorAssignments, setPrimarySupervisorAssignments] =
    useState<Record<number, OptionType>>({});
  const [teamSupervisorAssignments, setTeamSupervisorAssignments] = useState<
    Record<number, OptionType>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: supervisorRoles, isLoading: isSupervisorRolesLoading } =
    useGetSupervisedEmployeesAndTeams(employeeId, isOpen);
  const { data: searchedEmployees, isLoading: isSearchLoading } =
    useGetSearchedEmployees(searchTerm);

  const resetState = useCallback(() => {
    setPrimarySupervisorAssignments({});
    setTeamSupervisorAssignments({});
    setIsSubmitting(false);
    setSearchTerm("");
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onCancel();
  }, [resetState, onCancel]);

  const onTerminateSuccess = useCallback(() => {
    resetState();
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["terminateSuccessTitle"]),
      description: translateText(["terminateSuccessDescription"], {
        name: employeeName
      })
    });
    onActionSuccess();
  }, [
    resetState,
    setToastMessage,
    translateText,
    employeeName,
    onActionSuccess
  ]);

  const onDeleteSuccess = useCallback(() => {
    resetState();
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["deleteSuccessTitle"]),
      description: translateText(["deleteSuccessDescription"], {
        name: employeeName
      })
    });
    router.push(ROUTES.PEOPLE.DIRECTORY);
    onActionSuccess();
  }, [
    resetState,
    setToastMessage,
    translateText,
    employeeName,
    router,
    onActionSuccess
  ]);

  const onActionError = useCallback(() => {
    setIsSubmitting(false);
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["actionErrorTitle"]),
      description: translateText(["actionErrorDescription"])
    });
  }, [setToastMessage, translateText]);

  const { mutate: terminateEmployee } = useTerminateUser(
    onTerminateSuccess,
    onActionError,
    employeeId
  );
  const { mutate: deleteEmployee } = useDeleteUser(
    onDeleteSuccess,
    onActionError,
    employeeId
  );

  const onTransferSuccess = useCallback(() => {
    if (actionType === SupervisorReassignmentActionType.TERMINATE) {
      terminateEmployee();
    } else if (actionType === SupervisorReassignmentActionType.DELETE) {
      deleteEmployee();
    }
  }, [actionType, terminateEmployee, deleteEmployee]);

  const { mutate: transferSupervisors } = useTransferSupervisors(
    employeeId,
    onTransferSuccess,
    onActionError
  );

  const supervisedEmployees = supervisorRoles?.supervisedEmployees;
  const supervisedTeams = supervisorRoles?.supervisedTeams;

  const filteredEmployeeList = (searchedEmployees ?? []).filter(
    (employee) => Number(employee.employeeId) !== employeeId
  );

  const isProceedEnabled =
    supervisorRoles !== undefined &&
    Object.keys(primarySupervisorAssignments).length ===
      supervisedEmployees?.length &&
    Object.keys(teamSupervisorAssignments).length === supervisedTeams?.length;

  const handleProceed = () => {
    setIsSubmitting(true);
    const payload: TransferSupervisorsPayload = {
      primarySupervisors: (supervisedEmployees ?? []).map(
        (supervisedEmployee) => ({
          employeeId: supervisedEmployee.employeeId,
          newPrimarySupervisorId:
            primarySupervisorAssignments[supervisedEmployee.employeeId].id
        })
      ),
      teamSupervisors: (supervisedTeams ?? []).map((team) => ({
        teamId: team.teamId,
        newTeamSupervisorId: teamSupervisorAssignments[team.teamId].id
      }))
    };
    transferSupervisors(payload);
  };

  const handleSelectPrimarySupervisor = (
    newSupervisorId: number,
    newSupervisorName: string,
    supervisedEmployeeId: number
  ) => {
    setPrimarySupervisorAssignments((prev) => ({
      ...prev,
      [supervisedEmployeeId]: { id: newSupervisorId, name: newSupervisorName }
    }));
    setSearchTerm("");
  };

  const handleSelectTeamSupervisor = (
    newSupervisorId: number,
    newSupervisorName: string,
    teamId: number
  ) => {
    setTeamSupervisorAssignments((prev) => ({
      ...prev,
      [teamId]: { id: newSupervisorId, name: newSupervisorName }
    }));
    setSearchTerm("");
  };

  const handleDropdownBlur = () => setSearchTerm("");

  const proceedButtonLabel =
    actionType === SupervisorReassignmentActionType.TERMINATE
      ? translateText(["proceedAndTerminateButton"])
      : translateText(["proceedAndDeleteButton"]);

  const handlePrimarySupervisorMouseDown = (
    e: React.MouseEvent<HTMLButtonElement>,
    employee: any,
    supervisedEmployeeId: number
  ) => {
    e.preventDefault();
    handleSelectPrimarySupervisor(
      employee.employeeId,
      concatStrings([employee.firstName, employee.lastName]).trim(),
      supervisedEmployeeId
    );
  };

  const handleTeamSupervisorMouseDown = (
    e: React.MouseEvent<HTMLButtonElement>,
    employee: any,
    teamId: number
  ) => {
    e.preventDefault();
    handleSelectTeamSupervisor(
      employee.employeeId,
      concatStrings([employee.firstName, employee.lastName]).trim(),
      teamId
    );
  };

  const handleRemovePrimarySupervisor = (supervisedEmployeeId: number) => {
    setPrimarySupervisorAssignments((prev) => {
      const next = { ...prev };
      delete next[supervisedEmployeeId];
      return next;
    });
  };

  const handleRemoveTeamSupervisor = (teamId: number) => {
    setTeamSupervisorAssignments((prev) => {
      const next = { ...prev };
      delete next[teamId];
      return next;
    });
  };

  const modalContent = (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-4">
        <p className="body1">{translateText(["subtitle"])}</p>

        <div className="flex flex-col max-h-88 gap-4 [scrollbar-gutter:stable] overflow-y-auto pr-2">
          {isSupervisorRolesLoading && (
            <MultipleSkeletons numOfSkeletons={3} height={41} />
          )}

          {!isSupervisorRolesLoading && !!supervisedEmployees?.length && (
            <SupervisorReassignmentModalSection
              title={translateText(["primarySupervisorsSection"])}
              items={supervisedEmployees.map((supervisedEmployee) => ({
                employeeId: supervisedEmployee.employeeId,
                firstName: supervisedEmployee.firstName,
                lastName: supervisedEmployee.lastName,
                authPic: supervisedEmployee.authPic
              }))}
              showAvatar={true}
              isTeamSection={false}
              isSearchLoading={isSearchLoading}
              assignments={primarySupervisorAssignments}
              getResults={(supervisedEmployeeId) =>
                filteredEmployeeList
                  .filter(
                    (employee) =>
                      Number(employee.employeeId) !== supervisedEmployeeId
                  )
                  .map((employee) => (
                    <button
                      key={employee.employeeId}
                      type="button"
                      className="w-full text-left"
                      onMouseDown={(e) =>
                        handlePrimarySupervisorMouseDown(
                          e,
                          employee,
                          supervisedEmployeeId
                        )
                      }
                    >
                      {concatStrings([
                        employee.firstName,
                        employee.lastName
                      ]).trim()}
                    </button>
                  ))
              }
              onBlur={handleDropdownBlur}
              onSearch={setSearchTerm}
              onRemove={handleRemovePrimarySupervisor}
            />
          )}

          {!isSupervisorRolesLoading && !!supervisedTeams?.length && (
            <SupervisorReassignmentModalSection
              title={translateText(["teamSupervisorsSection"])}
              items={supervisedTeams.map((team) => ({
                teamId: team.teamId,
                teamName: team.teamName
              }))}
              showAvatar={false}
              isTeamSection={true}
              isSearchLoading={isSearchLoading}
              assignments={teamSupervisorAssignments}
              getResults={(teamId) =>
                filteredEmployeeList.map((employee) => (
                  <button
                    key={employee.employeeId}
                    type="button"
                    className="w-full text-left"
                    onMouseDown={(e) =>
                      handleTeamSupervisorMouseDown(e, employee, teamId)
                    }
                  >
                    {concatStrings([
                      employee.firstName,
                      employee.lastName
                    ]).trim()}
                  </button>
                ))
              }
              onBlur={handleDropdownBlur}
              onSearch={setSearchTerm}
              onRemove={handleRemoveTeamSupervisor}
            />
          )}
        </div>
      </div>

      <div className="flex flex-row gap-4 justify-end">
        <ButtonV2
          variant="tertiary"
          onClick={handleClose}
          disabled={isSubmitting}
        >
          {translateText(["cancelButton"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          onClick={handleProceed}
          disabled={isSubmitting || !isProceedEnabled}
        >
          {proceedButtonLabel}
        </ButtonV2>
      </div>
    </div>
  );

  return (
    <SmallModal
      isOpen={isOpen}
      onClose={handleClose}
      modalHeader={translateText(["modalTitle"])}
      content={modalContent}
      className="w-138.25"
      closeButtonAriaLabel={translateText(["closeModalAriaLabel"])}
    />
  );
};

export default SupervisorReassignmentModal;
