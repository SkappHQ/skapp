import { Grid2 as Grid } from "@mui/material";
import { FC } from "react";

import PeopleLayout from "~community/common/components/templates/PeopleLayout/PeopleLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCommonStore } from "~community/common/stores/commonStore";

import IndividualEmployeeInboxView from "./IndividualEmployeeInboxView";

interface Props {
  selectedUser: number;
}

const IndividualEmployeeDocumentView: FC<Props> = ({ selectedUser }) => {
  const translateText = useTranslator("attendanceModule", "timesheet");

  const { isDrawerToggled } = useCommonStore((state) => ({
    isDrawerToggled: state.isDrawerExpanded
  }));

  return (
    <PeopleLayout
      title={""}
      containerStyles={{
        padding: "0",
        margin: "0 auto",
        height: "auto",
        maxWidth: isDrawerToggled ? "90rem" : "103.125rem"
      }}
      showDivider={false}
      pageHead={translateText(["individualTimeSheetAnalytics.title"])}
    >
      <>
        <Grid
          size={{ xs: 12 }}
          sx={{
            marginTop: "1.5rem"
          }}
        >
          <IndividualEmployeeInboxView selectedUser={selectedUser} />
        </Grid>
      </>
    </PeopleLayout>
  );
};

export default IndividualEmployeeDocumentView;
