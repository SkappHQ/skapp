import { ArrowRightIcon, CloseIcon, SmallModal } from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/router";
import { FC, useCallback, useMemo, useState } from "react";

import MultipleSkeletons from "~community/common/components/molecules/Skeletons/MultipleSkeletons";
import ROUTES from "~community/common/constants/routes";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { OptionType } from "~community/common/types/CommonTypes";
import {
  useGetSearchedEmployees,
  useGetSupervisedEmployeesAndTeams,
  useReassignSupervisorsAndTerminateOrDeleteEmployee
} from "~community/people/api/PeopleApi";
import SupervisorReassignmentModalSection from "~community/people/components/molecules/SupervisorReassignmentModalSection/SupervisorReassignmentModalSection";
import { usePeopleStore } from "~community/people/store/store";
import {
  EmployeeRemoveAction,
  ReassignSupervisorsAndTerminateOrDeleteEmployeePayload
} from "~community/people/types/PeopleTypes";
import { concatStrings } from "~community/common/utils/commonUtil";

interface SupervisorReassignmentModalProps {
  isOpen: boolean;
  onCancel: () => void;
  employeeId: number;
  actionType: EmployeeRemoveAction;
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
  const { data: searchedEmployees, isLoading: isEmployeeSearchLoading } =
    useGetSearchedEmployees(searchTerm);

  const isSearchLoading =
    isEmployeeSearchLoading || searchedEmployees === undefined;

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

  const onSuccess = useCallback(() => {
    resetState();
    if (actionType === EmployeeRemoveAction.TERMINATE) {
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["terminateSuccessTitle"]),
        description: translateText(["terminateSuccessDescription"], {
          name: employeeName
        })
      });
    } else if (actionType === EmployeeRemoveAction.DELETE) {
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["deleteSuccessTitle"]),
        description: translateText(["deleteSuccessDescription"], {
          name: employeeName
        })
      });
      router.push(ROUTES.PEOPLE.DIRECTORY);
    } else {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["actionErrorTitle"]),
        description: translateText(["actionErrorDescription"])
      });
    }
    onActionSuccess();
  }, [
    resetState,
    actionType,
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

  const { mutate: reassignSupervisorsAndTerminateOrDeleteEmployee } =
    useReassignSupervisorsAndTerminateOrDeleteEmployee(
      employeeId,
      onSuccess,
      onActionError
    );

  const supervisedEmployees = supervisorRoles?.supervisedEmployees;
  const supervisedTeams = supervisorRoles?.supervisedTeams;

  const filteredEmployeeList = useMemo(
    () =>
      (searchedEmployees ?? []).filter(
        (employee) => Number(employee.employeeId) !== employeeId
      ),
    [searchedEmployees, employeeId]
  );

  const employeeList = useMemo(
    () => (isSearchLoading ? [] : filteredEmployeeList),
    [isSearchLoading, filteredEmployeeList]
  );

  const isProceedEnabled =
    supervisorRoles !== undefined &&
    Object.keys(primarySupervisorAssignments).length ===
      supervisedEmployees?.length &&
    Object.keys(teamSupervisorAssignments).length === supervisedTeams?.length;

  const handleProceed = () => {
    setIsSubmitting(true);
    const payload: ReassignSupervisorsAndTerminateOrDeleteEmployeePayload = {
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
      })),
      action: actionType
    };
    reassignSupervisorsAndTerminateOrDeleteEmployee(payload);
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

  const getPrimarySupervisorItems = useCallback(
    (supervisedEmployeeId: number) =>
      employeeList
        .filter(
          (employee) => Number(employee.employeeId) !== supervisedEmployeeId
        )
        .map((employee) => ({
          id: String(employee.employeeId),
          content: concatStrings([employee.firstName, employee.lastName]).trim()
        })),
    [employeeList]
  );

  const getTeamSupervisorItems = useCallback(
    (teamId: number) =>
      employeeList.map((employee) => ({
        id: String(employee.employeeId),
        content: concatStrings([employee.firstName, employee.lastName]).trim()
      })),
    [employeeList]
  );

  const proceedButtonLabel =
    actionType === EmployeeRemoveAction.TERMINATE
      ? translateText(["proceedAndTerminateButton"])
      : translateText(["proceedAndDeleteButton"]);

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

        <div className="flex flex-col gap-4 pr-2 overflow-y-auto max-h-[60vh]">
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
              isLoading={isSearchLoading}
              assignments={primarySupervisorAssignments}
              getItems={getPrimarySupervisorItems}
              onSearch={setSearchTerm}
              onSelect={(supervisedEmployeeId, selectedId, selectedName) => {
                handleSelectPrimarySupervisor(
                  Number(selectedId),
                  selectedName,
                  supervisedEmployeeId
                );
              }}
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
              isLoading={isSearchLoading}
              assignments={teamSupervisorAssignments}
              getItems={getTeamSupervisorItems}
              onSearch={setSearchTerm}
              onSelect={(teamId, selectedId, selectedName) => {
                handleSelectTeamSupervisor(
                  Number(selectedId),
                  selectedName,
                  teamId
                );
              }}
              onRemove={handleRemoveTeamSupervisor}
            />
          )}
        </div>
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
      buttons={{
        buttonLeft: {
          variant: "tertiary",
          onClick: handleClose,
          disabled: isSubmitting,
          icon: <CloseIcon />,
          iconPosition: "end",
          children: translateText(["cancelButton"])
        },
        buttonRight: {
          variant: "primary",
          onClick: handleProceed,
          disabled: isSubmitting || !isProceedEnabled,
          icon: <ArrowRightIcon />,
          iconPosition: "end",
          children: proceedButtonLabel
        }
      }}
    />
  );
};

export default SupervisorReassignmentModal;
