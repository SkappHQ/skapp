import { NextPage } from "next";

import ROUTES from "~community/common/constants/routes";
import useBreadcrumbs from "~community/common/hooks/useBreadcrumbs";
import AddNewResourceFlow from "~community/people/components/organisms/AddNewResourceFlow/AddNewResourceFlow";

const AddNewResource: NextPage = () => {
  useBreadcrumbs([
    {
      label: "people"
    },
    {
      label: "directory",
      href: ROUTES.PEOPLE.DIRECTORY
    },
    {
      label: "addNewResource"
    }
  ]);
  return <AddNewResourceFlow />;
};

export default AddNewResource;
