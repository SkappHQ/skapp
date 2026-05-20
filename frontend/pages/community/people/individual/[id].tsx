import ROUTES from "~community/common/constants/routes";
import useBreadcrumbs from "~community/common/hooks/useBreadcrumbs";
import PeopleIndividual from "~community/people/components/template/PeopleIndividual/PeopleIndividual";

const Individual = () => {
  useBreadcrumbs(
    ["people"],
    ["directory", ROUTES.PEOPLE.DIRECTORY],
    ["employeeProfile"]
  );
  return <PeopleIndividual />;
};

export default Individual;
