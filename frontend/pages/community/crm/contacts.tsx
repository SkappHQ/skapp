import { NextPage } from "next";
import { useShallow } from "zustand/react/shallow";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { Modules } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import ContactModalControllerV2 from "~community/crm/v2/components/organisms/ContactModalController/ContactModalController";
import ContactSidePanelV2 from "~community/crm/v2/components/organisms/ContactSidePanel/ContactSidePanel";
import { ContactTable as ContactTableV2 } from "~community/crm/v2/components/organisms/ContactTable/ContactTable";
import TaskModalControllerV2 from "~community/crm/v2/components/organisms/TaskModalController/TaskModalController";
import SidePanelWrapperV2 from "~community/crm/v2/components/templates/SidePanelWrapper/SidePanelWrapper";
import { useInitializeCrmData } from "~community/crm/v2/hooks/useInitializeCrmData";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmModalTypes as CrmModalTypesV2 } from "~community/crm/v2/types/CrmTypes";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

const Contacts: NextPage = () => {
  const translateText = useTranslator("crmModuleV2");
  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const { setIsContactModalOpen, setContactModalType, selectedContactId } =
    useCrmStoreV2(
      useShallow((store) => ({
        setIsContactModalOpen: store.setIsContactModalOpen,
        setContactModalType: store.setContactModalType,
        selectedContactId: store.selectedContactId
      }))
    );

  const { isCrmInitialDataLoading } = useInitializeCrmData();

  const onPrimaryButtonClick = () => {
    guardCrmCreate(CrmLimitResource.CONTACTS, () => {
      setIsContactModalOpen(true);
      setContactModalType(CrmModalTypesV2.ADD_CONTACT_MODAL);
    });
  };

  return (
    <ContentLayout
      breadcrumbs={[
        { label: translateText(["breadcrumbs", "crm"]) },
        { label: translateText(["contacts", "page", "title"]) }
      ]}
      pageHead={translateText(["contacts", "page", "pageHead"])}
      title={translateText(["contacts", "page", "title"])}
      primaryButtonText={translateText(["contacts", "page", "addContactBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      onPrimaryButtonClick={onPrimaryButtonClick}
      isPrimaryBtnLoading={isCheckingCrmLimit || isCrmInitialDataLoading}
      module={Modules.CRM}
    >
      <>
        {selectedContactId && (
          <SidePanelWrapperV2>
            <ContactSidePanelV2 contactId={selectedContactId} />
          </SidePanelWrapperV2>
        )}

        <ContactModalControllerV2 />
        <TaskModalControllerV2 />
        <ContactTableV2 isCrmDataLoading={isCrmInitialDataLoading} />
      </>
    </ContentLayout>
  );
};

export default Contacts;
