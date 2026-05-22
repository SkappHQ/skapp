import ROUTES from "~community/common/constants/routes";
import useBreadcrumbs from "~community/common/hooks/useBreadcrumbs";
import PeopleDirectoryEdit from "~community/people/components/template/PeopleDirectoryEdit/PeopleDirectoryEdit";

const Edit = () => {
  useBreadcrumbs([
    {
      label: "people"
    },
    {
      label: "directory",
      href: ROUTES.PEOPLE.DIRECTORY
    },
    {
      label: "editEmployeeProfile"
    }
  ]);
  return <PeopleDirectoryEdit />;
};

export default Edit;
