import useBreadcrumbs from "~community/common/hooks/useBreadcrumbs";
import PeopleAccount from "~community/people/components/template/PeopleAccount/PeopleAccount";

const Account = () => {
  useBreadcrumbs([{ label: "account" }]);

  return <PeopleAccount />;
};

export default Account;
