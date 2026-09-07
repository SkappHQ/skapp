import { NextPage } from "next";

import ROUTES from "~community/common/constants/routes";
import PeopleDirectoryAdd from "~community/people/components/template/PeopleDirectoryAdd/PeopleDirectoryAdd";

const AddPeople: NextPage = () => {
  return <PeopleDirectoryAdd />;
};

export default AddPeople;
