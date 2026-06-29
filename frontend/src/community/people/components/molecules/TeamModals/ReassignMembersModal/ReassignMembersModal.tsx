import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { useTransferTeamMembers } from "~community/people/api/TeamApi";
import ReassignMemberRow from "~community/people/components/molecules/ReassignMemberRow/ReassignMemberRow";
import { usePeopleStore } from "~community/people/store/store";
import { EmployeeType } from "~community/people/types/EmployeeTypes";
import { TeamModelTypes, TeamType } from "~community/people/types/TeamTypes";

interface Props {
  transferableMembers: EmployeeType[];
  availableTeamsMap: Map<number, TeamType[]>;
}

const ReassignMembersModal = ({
  transferableMembers,
  availableTeamsMap
}: Props) => {
  const translateText = useTranslator("peopleModule", "teams");
  const {
    currentDeletingTeam,
    setTeamModalType,
    setIsTeamModalOpen,
    setCurrentDeletingTeam
  } = usePeopleStore((state) => state);

  const { mutateAsync } = useTransferTeamMembers();
  const { setToastMessage } = useToast();

  const [memberTeamAssignments, setMemberTeamAssignments] = useState<
    Record<number, number>
  >({});

  const setTeamId = (employeeId: number, teamId: number) => {
    setMemberTeamAssignments((prevAssignments) => ({
      ...prevAssignments,
      [employeeId]: teamId
    }));
  };

  const reassignAndDeleteClick = async () => {
    if (!currentDeletingTeam) return;

    const transferMembers = transferableMembers
      .filter((member) => memberTeamAssignments[Number(member.employeeId)] !== undefined)
      .map((member) => ({
        employeeId: Number(member.employeeId),
        teamId: memberTeamAssignments[Number(member.employeeId)]
      }));

    const data = {
      teamId: currentDeletingTeam.teamId.toString(),
      transferMembers
    };

    try {
      await mutateAsync(data);
      setToastMessage({
        open: true,
        toastType: "success",
        title: translateText(["teamDeleteSuccessTitle"]),
        description: translateText(["teamDeleteSuccessDes"]),
        isIcon: true
      });
      setIsTeamModalOpen(false);
      setCurrentDeletingTeam(undefined);
    } catch {
      setToastMessage({
        open: true,
        toastType: "error",
        title: translateText(["teamDeleteFailTitle"]),
        description: translateText(["teamDeleteFailDes"]),
        isIcon: true
      });
    }
  };

  const cancelClick = () => {
    setIsTeamModalOpen(false);
    setTeamModalType(TeamModelTypes.REASSIGN_MEMBERS);
    setCurrentDeletingTeam(undefined);
  };

  return (
    <div>
      <p className="my-4">{translateText(["reassignModalDes"])}</p>
      <div className="flex flex-col gap-2 max-h-56 overflow-auto">
        {transferableMembers.map((member) => (
          <ReassignMemberRow
            key={member.employeeId}
            teamMember={member}
            availableTeams={
              availableTeamsMap.get(Number(member.employeeId)) || []
            }
            setTeamId={(teamId) => setTeamId(Number(member.employeeId), teamId)}
          />
        ))}
      </div>
      <div className="flex flex-row justify-end gap-3 mt-4">
        <ButtonV2
          variant={"tertiary"}
          onClick={cancelClick}
          icon={<Icon name={IconName.CLOSE_ICON} />}
          iconPosition="end"
        >
          {translateText(["cancelBtnText"])}
        </ButtonV2>
        <ButtonV2
          variant={"error"}
          onClick={reassignAndDeleteClick}
          icon={
            <Icon
              name={IconName.DELETE_BUTTON_ICON}
              fill="var(--color-semantic-red-text)"
            />
          }
          iconPosition="end"
        >
          {translateText(["reassignAndDeleteBtnText"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default ReassignMembersModal;
