import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo } from "react";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import { ButtonStyle, ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { useGetUserRoleRestrictions } from "~community/configurations/api/userRolesApi";
import ModuleRolesTable from "~community/configurations/components/molecules/ModuleRolesTable/ModuleRolesTable";
import RestrictedUserRolesModal from "~community/configurations/components/organisms/RestrictedUserRolesModal/RestrictedUserRolesModal";
import { useConfigurationStore } from "~community/configurations/stores/configurationStore";
import { mapApiModuleToEnum } from "~community/configurations/utils/userRoles/apiUtils";

const Module: NextPage = () => {
  const router = useRouter();
  const { module } = router.query;

  const formattedModule = useMemo(() => {
    return mapApiModuleToEnum(module?.toString());
  }, [module]);

  const translateText = useTranslator("configurations");

  const { setToastMessage } = useToast();

  const { setIsUserRoleModalOpen, setModuleType } = useConfigurationStore();

  const {
    data: initialData,
    isFetching,
    isError
  } = useGetUserRoleRestrictions(formattedModule);

  const onPrimaryButtonClick = () => {
    if (isError || !initialData) {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["userRoles.errorToastTitle"]),
        description: translateText(["userRoles.errorToastDescription"])
      });
      return;
    }

    setModuleType(formattedModule);
    setIsUserRoleModalOpen(true);
  };

  const onBackClick = () => {
    router.push(ROUTES.CONFIGURATIONS.USER_ROLES_TAB);
  };

  return (
    <ContentLayout
      breadcrumbs={[
        {
          label: translateText(["title"]),
          onClick: () => router.push(ROUTES.CONFIGURATIONS.USER_ROLES_TAB)
        },
        { label: translateText([`userRoles.${module}Title`]) }
      ]}
      pageHead={translateText(["userRoles.pageHead"])}
      title={translateText([`userRoles.${module}Title`])}
      primaryButtonText={translateText(["userRoles.setRestrictionsBtnText"])}
      primaryButtonType={ButtonStyle.SECONDARY}
      primaryBtnIconName={IconName.RESTRICTIONS_ICON}
      onPrimaryButtonClick={onPrimaryButtonClick}
      isPrimaryBtnLoading={isFetching}
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
