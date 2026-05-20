import { NextPage } from "next";

import ROUTES from "~community/common/constants/routes";
import useBreadcrumbs from "~community/common/hooks/useBreadcrumbs";
import PeopleDirectoryAdd from "~community/people/components/template/PeopleDirectoryAdd/PeopleDirectoryAdd";

const AddPeople: NextPage = () => {
  useBreadcrumbs(
    ["people"],
    ["directory", ROUTES.PEOPLE.DIRECTORY],
    ["addTeamMembers"]
  );
  return <PeopleDirectoryAdd />;
};

export default AddPeople;
