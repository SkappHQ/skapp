import ROUTES from "~community/common/constants/routes";
import useBreadcrumbs from "~community/common/hooks/useBreadcrumbs";
import PeopleIndividual from "~community/people/components/template/PeopleIndividual/PeopleIndividual";

const Individual = () => {
  useBreadcrumbs([
    {
      label: "people"
    },
    {
      label: "directory",
      href: ROUTES.PEOPLE.DIRECTORY
    },
    {
      label: "employeeProfile"
    }
  ]);
  return <PeopleIndividual />;
};

export default Individual;
