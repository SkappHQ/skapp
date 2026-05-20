import { type NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import useBreadcrumbs from "~community/common/hooks/useBreadcrumbs";
import { useTranslator } from "~community/common/hooks/useTranslator";
import UserRolesTable from "~community/configurations/components/molecules/UserRolesTable/UserRolesTable";

const UserRoles: NextPage = () => {
  useBreadcrumbs(
    ["configurations", ROUTES.CONFIGURATIONS.BASE],
    ["moduleRoles"]
  );

  const translateText = useTranslator("configurations", "userRoles");

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      isDividerVisible={true}
    >
      <UserRolesTable />
    </ContentLayout>
  );
};

export default UserRoles;
