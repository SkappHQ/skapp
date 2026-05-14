import {
  AutoCompleteDropdown,
  ButtonV2,
  SmallModal
} from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/router";
import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useEffect,
  useState
} from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import MultipleSkeletons from "~community/common/components/molecules/Skeletons/MultipleSkeletons";
import ROUTES from "~community/common/constants/routes";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import {
  useDeleteUser,
  useGetSearchedEmployees,
  useGetSupervisorRoles,
  useTerminateUser,
  useTransferSupervisors
} from "~community/people/api/PeopleApi";
import {
  EmployeeDataTeamType,
  SupervisedEmployee,
  SupervisorReassignmentActionType,
  TransferSupervisorsPayload
} from "~community/people/types/PeopleTypes";
import { concatStrings } from "~community/people/utils/jobFamilyUtils/commonUtils";

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  employeeId: number;
  employeeName: string;
  actionType: SupervisorReassignmentActionType;
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

  const [primarySupervisorAssignments, setPrimarySupervisorAssignments] =
    useState<Record<number, number>>({});
  const [teamSupervisorAssignments, setTeamSupervisorAssignments] = useState<
    Record<number, number>
  >({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [nameMap, setNameMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (!isOpen) {
      setPrimarySupervisorAssignments({});
      setTeamSupervisorAssignments({});
      setIsSubmitting(false);
      setSearchTerm("");
      setOpenDropdownId(null);
      setNameMap(new Map());
    }
  }, [isOpen]);

  const { data: supervisorRoles } = useGetSupervisorRoles(employeeId, isOpen);
  const { data: searchedEmployees, isLoading: isSearchLoading } =
    useGetSearchedEmployees(searchTerm);

  const supervisedEmployees: SupervisedEmployee[] =
    supervisorRoles?.supervisedEmployees ?? [];
  const supervisedTeams: EmployeeDataTeamType[] =
    supervisorRoles?.supervisedTeams ?? [];

  const candidateList = (searchedEmployees ?? []).filter(
    (emp) => Number(emp.employeeId) !== employeeId
  );

  const allPrimaryAssigned = supervisedEmployees.every(
    (emp) => !!primarySupervisorAssignments[emp.employeeId]
  );

  const allTeamAssigned = supervisedTeams.every(
    (team) => !!teamSupervisorAssignments[team.teamId]
  );

  const isProceedEnabled =
    supervisorRoles !== undefined && allPrimaryAssigned && allTeamAssigned;

  const onTerminateSuccess = () => {
    setIsSubmitting(false);
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["terminateSuccessTitle"]),
      description: translateText(["terminateSuccessDescription"], {
        name: employeeName
      })
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
      })
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
      description: translateText(["actionErrorDescription"])
    });
  };

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
    } else {
      deleteEmployee();
    }
  }, [actionType, terminateEmployee, deleteEmployee]);

  const { mutate: transferSupervisors } = useTransferSupervisors(
    employeeId,
    onTransferSuccess,
    onActionError
  );

  const handleProceed = () => {
    setIsSubmitting(true);
    const payload: TransferSupervisorsPayload = {
      primarySupervisors: supervisedEmployees.map((emp) => ({
        employeeId: emp.employeeId,
        newPrimarySupervisorId: primarySupervisorAssignments[emp.employeeId]
      })),
      teamSupervisors: supervisedTeams.map((team) => ({
        teamId: team.teamId,
        newTeamSupervisorId: teamSupervisorAssignments[team.teamId]
      }))
    };
    transferSupervisors(payload);
  };

  const handleSelectSupervisor = (
    candidateId: number,
    candidateName: string,
    entityId: number,
    setAssignment: Dispatch<SetStateAction<Record<number, number>>>
  ) => {
    setNameMap((prev) => new Map(prev).set(String(candidateId), candidateName));
    setAssignment((prev) => ({ ...prev, [entityId]: candidateId }));
    setSearchTerm("");
    setOpenDropdownId(null);
  };

  const proceedButtonLabel =
    actionType === SupervisorReassignmentActionType.TERMINATE
      ? translateText(["proceedAndTerminateButton"])
      : translateText(["proceedAndDeleteButton"]);

  const modalContent = (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-4">
        <p className="body1">{translateText(["subtitle"])}</p>

        <div
          className={`flex flex-col max-h-88 gap-4 [scrollbar-gutter:stable] ${
            openDropdownId && searchTerm.length > 0
              ? "overflow-y-visible"
              : "overflow-y-auto"
          }`}
        >
          {supervisorRoles === undefined && (
            <MultipleSkeletons numOfSkeletons={3} height={41} />
          )}
          {supervisorRoles !== undefined && supervisedEmployees.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="subtitle2">
                {translateText(["primarySupervisorsSection"])}
              </p>
              <div className="flex flex-col gap-3">
                {supervisedEmployees.map((emp) => {
                  const dropdownId = `primary-${emp.employeeId}`;
                  const assignedId =
                    primarySupervisorAssignments[emp.employeeId];
                  const assignedName = assignedId
                    ? (nameMap.get(String(assignedId)) ?? "")
                    : null;
                  return (
                    <div
                      key={emp.employeeId}
                      className="flex flex-row items-center justify-between gap-3 min-h-10.25"
                    >
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <AvatarChip
                          firstName={emp.firstName}
                          lastName={emp.lastName}
                          avatarUrl={emp.authPic}
                          chipStyles={{
                            justifyContent: "flex-start",
                            color: "text.primary"
                          }}
                        />
                      </div>
                      <div className="w-62.5 shrink-0">
                        {assignedName === null ? (
                          <AutoCompleteDropdown
                            hasCard={false}
                            className="w-full!"
                            isOpen={
                              openDropdownId === dropdownId &&
                              searchTerm.length > 0
                            }
                            onFocus={() => {
                              setOpenDropdownId(dropdownId);
                              setSearchTerm("");
                            }}
                            onBlur={() => {
                              setOpenDropdownId(null);
                              setSearchTerm("");
                            }}
                            placeholder={translateText([
                              "selectSupervisorPlaceholder"
                            ])}
                            onSearch={setSearchTerm}
                            accessibilityTexts={{
                              noResultsFoundText: isSearchLoading
                                ? ""
                                : translateText(["noEmployeesFound"])
                            }}
                            results={candidateList
                              .filter(
                                (ae) => Number(ae.employeeId) !== emp.employeeId
                              )
                              .map((ae) => (
                                <button
                                  key={ae.employeeId}
                                  type="button"
                                  className="w-full text-left"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelectSupervisor(
                                      ae.employeeId,
                                      concatStrings([
                                        ae.firstName,
                                        ae.lastName
                                      ]).trim(),
                                      emp.employeeId,
                                      setPrimarySupervisorAssignments
                                    );
                                  }}
                                >
                                  {ae.firstName} {ae.lastName}
                                </button>
                              ))}
                          />
                        ) : (
                          <div className="flex items-center justify-between gap-2 rounded-lg bg-tertiary-background border border-transparent px-3 py-2.5">
                            <span className="body2 truncate flex-1">
                              {assignedName}
                            </span>
                            <button
                              type="button"
                              aria-label={translateText(["removeAssignment"])}
                              className="shrink-0 text-secondary-icon hover:text-secondary-text leading-none"
                              onClick={() =>
                                setPrimarySupervisorAssignments((prev) => {
                                  const next = { ...prev };
                                  delete next[emp.employeeId];
                                  return next;
                                })
                              }
                            >
                              <Icon
                                name={IconName.CLOSE_ICON}
                                width="16"
                                height="16"
                              />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {supervisorRoles !== undefined && supervisedTeams.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="subtitle2">
                {translateText(["teamSupervisorsSection"])}
              </p>
              <div className="flex flex-col gap-3">
                {supervisedTeams.map((team) => {
                  const dropdownId = `team-${team.teamId}`;
                  const assignedId = teamSupervisorAssignments[team.teamId];
                  const assignedName = assignedId
                    ? (nameMap.get(String(assignedId)) ?? "")
                    : null;
                  return (
                    <div
                      key={team.teamId}
                      className="flex flex-row items-center justify-between gap-3 min-h-10.25"
                    >
                      <div className="w-31.25 overflow-hidden shrink-0">
                        <p className="body2 truncate">{team.teamName}</p>
                      </div>
                      <div className="w-62.5 shrink-0">
                        {assignedName === null ? (
                          <AutoCompleteDropdown
                            hasCard={false}
                            className="w-full!"
                            isOpen={
                              openDropdownId === dropdownId &&
                              searchTerm.length > 0
                            }
                            onFocus={() => {
                              setOpenDropdownId(dropdownId);
                              setSearchTerm("");
                            }}
                            onBlur={() => {
                              setOpenDropdownId(null);
                              setSearchTerm("");
                            }}
                            placeholder={translateText([
                              "selectSupervisorPlaceholder"
                            ])}
                            onSearch={setSearchTerm}
                            accessibilityTexts={{
                              noResultsFoundText: isSearchLoading
                                ? ""
                                : translateText(["noEmployeesFound"])
                            }}
                            results={candidateList.map((ae) => (
                              <button
                                key={ae.employeeId}
                                type="button"
                                className="w-full text-left"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSelectSupervisor(
                                    ae.employeeId,
                                    concatStrings([
                                      ae.firstName,
                                      ae.lastName
                                    ]).trim(),
                                    team.teamId,
                                    setTeamSupervisorAssignments
                                  );
                                }}
                              >
                                {ae.firstName} {ae.lastName}
                              </button>
                            ))}
                          />
                        ) : (
                          <div className="flex items-center justify-between gap-2 rounded-lg bg-tertiary-background border border-transparent px-3 py-2.5">
                            <span className="body2 truncate flex-1">
                              {assignedName}
                            </span>
                            <button
                              type="button"
                              aria-label={translateText(["removeAssignment"])}
                              className="shrink-0 text-secondary-icon hover:text-secondary-text leading-none"
                              onClick={() =>
                                setTeamSupervisorAssignments((prev) => {
                                  const next = { ...prev };
                                  delete next[team.teamId];
                                  return next;
                                })
                              }
                            >
                              <Icon
                                name={IconName.CLOSE_ICON}
                                width="16"
                                height="16"
                              />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-row gap-4 justify-end">
        <ButtonV2 variant="tertiary" onClick={onCancel} disabled={isSubmitting}>
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
      onClose={onCancel}
      modalHeader={translateText(["modalTitle"])}
      content={modalContent}
      className="w-138.25"
      closeButtonAriaLabel={translateText(["closeModalAriaLabel"])}
    />
  );
};

export default SupervisorReassignmentModal;
