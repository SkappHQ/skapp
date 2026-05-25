import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { Modules } from "~community/common/enums/CommonEnums";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { getUserRoleRestrictions } from "~community/configurations/api/userRolesApi";
import ModuleRolesTable from "~community/configurations/components/molecules/ModuleRolesTable/ModuleRolesTable";
import RestrictedUserRolesModal from "~community/configurations/components/organisms/RestrictedUserRolesModal/RestrictedUserRolesModal";
import { useConfigurationStore } from "~community/configurations/stores/configurationStore";
import { UserRoleRestrictionsType } from "~community/configurations/types/UserRolesTypes";

const Module: NextPage = () => {
  const router = useRouter();
  const { module } = router.query;

  const formattedModule = useMemo(() => {
    return module?.toString().toUpperCase() as Modules;
  }, [module]);

  const translateText = useTranslator("configurations");

  const { setIsUserRoleModalOpen, setModuleType } = useConfigurationStore();

  const [isPending, setIsPending] = useState<boolean>(false);
  const [initialData, setInitialData] = useState<
    UserRoleRestrictionsType | undefined
  >();

  const onPrimaryButtonClick = async () => {
    setIsPending(true);

    const data = await getUserRoleRestrictions(formattedModule);

    setInitialData(data);
    setIsPending(false);
    setIsUserRoleModalOpen(true);
    setModuleType(formattedModule);
  };

  return (
    <ContentLayout
      breadcrumbs={[
        { label: translateText(["title"]) },
        { label: translateText([`userRoles.${module}Title`]) }
      ]}
      pageHead={translateText(["userRoles.pageHead"])}
      title={translateText([`userRoles.${module}Title`])}
      primaryButtonText={translateText(["userRoles.setRestrictionsBtnText"])}
      primaryButtonType={ButtonStyle.SECONDARY}
      primaryBtnIconName={IconName.RESTRICTIONS_ICON}
      onPrimaryButtonClick={onPrimaryButtonClick}
      isPrimaryBtnLoading={isPending}
      isDividerVisible={true}
      isBackButtonVisible={true}
      onBackClick={onBackClick}
    >
      <>
        <ModuleRolesTable module={formattedModule} />
        {initialData !== undefined && (
          <RestrictedUserRolesModal initialData={initialData} />
        )}
      </>
    </ContentLayout>
  );
};

export default Module;
