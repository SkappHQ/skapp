import {
  Box,
  SelectChangeEvent,
  Stack,
  Theme,
  Typography,
  useTheme
} from "@mui/material";
import { useSession } from "next-auth/react";
import * as React from "react";
import { FC, useEffect, useState } from "react";

import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import RoundedSelect from "~community/common/components/molecules/RoundedSelect/RoundedSelect";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { AdminTypes } from "~community/common/types/AuthTypes";
import { MAX_NUM_OF_SUPERVISORS_PER_TEAM } from "~community/people/constants/configs";
import { MemberTypes } from "~community/people/enums/TeamEnums";
import { EmployeeDataType } from "~community/people/types/EmployeeTypes";
import { TeamMemberTypes } from "~community/people/types/TeamTypes";

import styles from "./styles";

interface Props {
  id: string;
  employeeData: EmployeeDataType;
  userType: MemberTypes.MEMBER | MemberTypes.SUPERVISOR;
  teamMembers: TeamMemberTypes;
  setTeamMembers: (teamMembers: TeamMemberTypes) => void;
}

const AddTeamMemberRow: FC<Props> = ({
  id,
  employeeData,
  userType,
  teamMembers,
  setTeamMembers
}) => {
  const translateText = useTranslator("peopleModule", "teams");
  const translateAria = useTranslator("peopleAria", "teams", "modal");

  const theme: Theme = useTheme();
  const classes = styles(theme);

  const { setToastMessage } = useToast();

  const { data: session } = useSession();

  const isAdmin = session?.user?.roles?.includes(AdminTypes.PEOPLE_ADMIN);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedUserType, setSelectedUserType] =
    useState<MemberTypes>(userType);
  const [showOverlay, setShowOverlay] = useState<boolean>(false);

  const itemList = [
    { label: MemberTypes.MEMBER, value: MemberTypes.MEMBER },
    {
      label: MemberTypes.SUPERVISOR,
      value: MemberTypes.SUPERVISOR,
      disabled:
        teamMembers?.supervisor?.length >= MAX_NUM_OF_SUPERVISORS_PER_TEAM
    }
  ];

  const setUserType = (e: SelectChangeEvent) => {
    const newValue = e.target.value;

    const updatedMembers = teamMembers?.members?.filter(
      (user: EmployeeDataType) => user?.employeeId !== employeeData?.employeeId
    );

    const updatedSupervisors = teamMembers?.supervisor?.filter(
      (user: EmployeeDataType) => user?.employeeId !== employeeData?.employeeId
    );

    if (newValue === MemberTypes.SUPERVISOR) {
      const isAlreadySupervisor =
        teamMembers?.supervisor.length !== updatedSupervisors?.length;
      if (!isAlreadySupervisor && updatedSupervisors?.length < 3) {
        setTeamMembers({
          ...teamMembers,
          supervisor: [...updatedSupervisors, employeeData],
          members: updatedMembers
        });
        setSelectedUserType(newValue);
      } else if (updatedSupervisors?.length >= 3) {
        setToastMessage({
          open: true,
          title: translateText(["noOfSupervisorsExceedingToastMessageTitle"]),
          description: translateText([
            "noOfSupervisorsExceedingToastMessageDescription"
          ]),
          toastType: "error"
        });
      }
    } else {
      const isAlreadyMember =
        teamMembers?.members?.length !== updatedMembers?.length;
      if (!isAlreadyMember) {
        setTeamMembers({
          ...teamMembers,
          members: [...updatedMembers, employeeData],
          supervisor: updatedSupervisors
        });
        setSelectedUserType(newValue);
      }
    }
    setShowOverlay(false);
  };

  useEffect(() => {
    setSelectedUserType(userType);
  }, [userType]);

  return (
    <Stack
      width={"100%"}
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={1}
    >
      <Stack
        component="div"
        direction="row"
        justifyContent="start"
        alignItems="center"
        maxWidth="72%"
      >
        <Box width="100%">
          <AvatarChip
            firstName={employeeData?.firstName}
            lastName={employeeData?.lastName}
            avatarUrl={employeeData?.authPic}
            chipStyles={{
              color: "common.black",
              maxWidth: "fit-content"
            }}
          />
        </Box>
        <Typography sx={classes.jobTitle}>
          {`${employeeData?.jobLevel ?? ""} ${employeeData?.jobRole ?? ""}`}
        </Typography>
      </Stack>
      <RoundedSelect
        id="add-team-member-type-select"
        onChange={setUserType}
        options={itemList}
        value={selectedUserType}
        disabled={!isAdmin}
        customStyles={{
          select: {
            "&.MuiInputBase-root": {
              marginLeft: "0rem"
            }
          }
        }}
      />
    </Stack>
  );
};

export default AddTeamMemberRow;
