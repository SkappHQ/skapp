import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { getUserRoleRestrictions } from "~community/configurations/api/userRolesApi";
import ModuleRolesTable from "~community/configurations/components/molecules/ModuleRolesTable/ModuleRolesTable";
import RestrictedUserRolesModal from "~community/configurations/components/organisms/RestrictedUserRolesModal/RestrictedUserRolesModal";
import { useConfigurationStore } from "~community/configurations/stores/configurationStore";
import { UserRoleRestrictionsType } from "~community/configurations/types/UserRolesTypes";
import { mapApiModuleToEnum } from "~community/configurations/utils/userRoles/apiUtils";

const Module: NextPage = () => {
  const router = useRouter();
  const { module } = router.query;

  const formattedModule = useMemo(() => {
    return mapApiModuleToEnum(module?.toString() ?? "");
  }, [module]);

  const translateText = useTranslator("configurations", "userRoles");

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
      pageHead={translateText(["pageHead"])}
      title={translateText([`${module}Title`])}
      primaryButtonText={translateText(["setRestrictionsBtnText"])}
      primaryButtonType={ButtonStyle.SECONDARY}
      primaryBtnIconName={IconName.RESTRICTIONS_ICON}
      onPrimaryButtonClick={onPrimaryButtonClick}
      isPrimaryBtnLoading={isPending}
      isDividerVisible={true}
      isBackButtonVisible={true}
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
