import { type NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import UserRolesTable from "~community/configurations/components/molecules/UserRolesTable/UserRolesTable";

const UserRoles: NextPage = () => {
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
