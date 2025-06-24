import { SelectChangeEvent } from "@mui/material";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { AdminTypes } from "~community/common/types/AuthTypes";
import {
  useGetAllManagerTeams,
  useGetAllTeams
} from "~community/people/api/TeamApi";

import RoundedSelect from "../RoundedSelect/RoundedSelect";

const TeamSelect = ({
  value,
  onChange,
  adminType
}: {
  onChange: (event: SelectChangeEvent) => void;
  value: string;
  adminType?: AdminTypes;
}) => {
  const translateTexts = useTranslator("attendanceModule", "timesheet");

  const { data } = useSession();

  const { data: allTeamsData } = useGetAllTeams();
  const { data: allManagerTeamsData } = useGetAllManagerTeams();

  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const checkForUserRoles = useMemo(() => {
    if (data?.user?.roles) {
      return (
        data.user.roles.includes(AdminTypes.SUPER_ADMIN) ||
        (adminType && data.user.roles.includes(adminType))
      );
    }
    return false;
  }, [data, adminType]);

  const options = useMemo(() => {
    if (checkForUserRoles) {
      setIsAdmin(true);

      const allTeamsOptions =
        allTeamsData?.map((team) => ({
          label: team.teamName,
          value: team.teamId.toString()
        })) || [];

      return [
        { label: translateTexts(["allLabel"]), value: "-1" },
        ...allTeamsOptions
      ];
    } else {
      setIsAdmin(false);

      const managerTeamsOptions =
        allManagerTeamsData?.managerTeams?.map((team) => ({
          label: team.teamName,
          value: team.teamId.toString()
        })) || [];

      return [
        { label: translateTexts(["allLabel"]), value: "-1" },
        ...managerTeamsOptions
      ];
    }
  }, [allManagerTeamsData, allTeamsData, adminType]);

  return (
    <RoundedSelect
      id="team-select"
      options={options}
      name="team"
      disabled={options.length === 0 && !isAdmin}
      value={value}
      renderValue={(value) => {
        const selectedOption = options.find((option) => option.value === value);
        if (selectedOption) {
          return selectedOption.label;
        }
      }}
      onChange={onChange}
    />
  );
};

export default TeamSelect;
