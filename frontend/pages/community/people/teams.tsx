import { Box } from "@mui/material";
import { NextPage } from "next";
import { useState } from "react";

import SearchBox from "~community/common/components/molecules/SearchBox/SearchBox";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import useBreadcrumbs from "~community/common/hooks/useBreadcrumbs";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetAllTeams } from "~community/people/api/TeamApi";
import TeamsTable from "~community/people/components/molecules/TeamsTable/TeamsTable";
import TeamModalController from "~community/people/components/organisms/TeamModalController/TeamModalController";
import { usePeopleStore } from "~community/people/store/store";
import { TeamModelTypes } from "~community/people/types/TeamTypes";

const Teams: NextPage = () => {
  useBreadcrumbs(["people", ROUTES.PEOPLE.BASE], ["teams"]);
  const translateText = useTranslator("peopleModule", "teams");
  const [teamSearchTerm, setTeamSearchTerm] = useState<string>("");

  const { setTeamModalType, setIsTeamModalOpen } = usePeopleStore((state) => ({
    setTeamModalType: state.setTeamModalType,
    setIsTeamModalOpen: state.setIsTeamModalOpen
  }));

  const { isPeopleAdmin } = useSessionData();

  const { data: allTeams } = useGetAllTeams();

  return (
    <>
      <ContentLayout
        pageHead={translateText(["tabTitle"])}
        title={translateText(["title"])}
        primaryButtonText={
          isPeopleAdmin &&
          (allTeams?.length ?? 0) !== 0 &&
          translateText(["addTeam"])
        }
        onPrimaryButtonClick={() => {
          setIsTeamModalOpen(true);
          setTeamModalType(TeamModelTypes.ADD_TEAM);
        }}
        isDividerVisible
      >
        <Box>
          <SearchBox
            value={teamSearchTerm}
            setSearchTerm={setTeamSearchTerm}
            placeHolder={translateText(["teamSearchPlaceholder"])}
          />
          <TeamsTable
            teamSearchTerm={teamSearchTerm}
            teamAddButtonButtonClick={() => {
              setIsTeamModalOpen(true);
              setTeamModalType(TeamModelTypes.ADD_TEAM);
            }}
            teamAddButtonText={translateText(["addTeam"])}
            isAdmin={isPeopleAdmin}
          />
          <TeamModalController />
        </Box>
      </ContentLayout>
    </>
  );
};

export default Teams;
