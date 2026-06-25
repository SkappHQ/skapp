import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC, useMemo, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { useTransferTeamMembers } from "~community/people/api/TeamApi";
import ReassignMemberRow from "~community/people/components/molecules/ReassignMemberRow/ReassignMemberRow";
import { usePeopleStore } from "~community/people/store/store";
import { TeamModelTypes, TeamType } from "~community/people/types/TeamTypes";

interface ReassignMembersModalProps {
  transferableMembersMap: Map<number, TeamType[]>;
}

const ReassignMembersModal: FC<ReassignMembersModalProps> = ({ transferableMembersMap }) => {
  const translateText = useTranslator("peopleModule", "teams");
  const {
    currentDeletingTeam,
    setTeamModalType,
    setIsTeamModalOpen,
    setCurrentDeletingTeam
  } = usePeopleStore((state) => state);

  const { mutate } = useTransferTeamMembers();
  const { setToastMessage } = useToast();

  const [memberTeamAssignments, setMemberTeamAssignments] = useState<
    Record<number, number>
  >({});

  const allMembers = useMemo(
    () => [
      ...(currentDeletingTeam?.supervisors || []),
      ...(currentDeletingTeam?.teamMembers || [])
    ],
    [currentDeletingTeam]
  );

  const displayedMembers = useMemo(
    () =>
      allMembers
        .filter((member) =>
          transferableMembersMap.has(Number(member.employeeId))
        )
        .map((member) => ({
          member,
          transferableTeams:
            transferableMembersMap.get(Number(member.employeeId)) ?? []
        })),
    [allMembers, transferableMembersMap]
  );

  const setTeamId = (employeeId: number, teamId: number) => {
    setMemberTeamAssignments((prevAssignments) => ({
      ...prevAssignments,
      [employeeId]: teamId
    }));
  };

  const reassignAndDeleteClick = async () => {
    const transferMembers = displayedMembers.map(({ member }) => ({
      employeeId: +member.employeeId,
      teamId: memberTeamAssignments[+member.employeeId] || null
    }));

    const data = {
      teamId: currentDeletingTeam?.teamId,
      transferMembers
    };

    try {
      await mutate(data);
      setToastMessage({
        open: true,
        toastType: "success",
        title: translateText(["teamDeleteSuccessTitle"]),
        description: translateText(["teamDeleteSuccessDes"]),
        isIcon: true
      });
      setIsTeamModalOpen(false);
      setCurrentDeletingTeam(undefined);
    } catch (error) {
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
        {displayedMembers.map(({ member, transferableTeams }) => (
          <ReassignMemberRow
            key={member.employeeId}
            teamMember={member}
            transferableTeams={transferableTeams}
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
