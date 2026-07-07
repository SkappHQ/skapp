import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { Modules } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import SidePanelWrapper from "~community/crm/components/atoms/SidePanelWrapper/SidePanelWrapper";
import ContactModalController from "~community/crm/components/organisms/ContactModalController/ContactModalController";
import ContactSidePanel from "~community/crm/components/organisms/ContactSidePanel/ContactSidePanel";
import { ContactTable } from "~community/crm/components/organisms/ContactTable/ContactTable";
import TaskModalController from "~community/crm/components/organisms/TaskModalController/TaskModalController";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

const Contacts: NextPage = () => {
  const translateText = useTranslator("crmModule", "contacts");
  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const { setIsContactModalOpen, setContactModalType, selectedContactId } =
    useCrmStore((store) => ({
      setIsContactModalOpen: store.setIsContactModalOpen,
      setContactModalType: store.setContactModalType,
      selectedContactId: store.selectedContactId
    }));

  const onPrimaryButtonClick = () => {
    guardCrmCreate(CrmLimitResource.CONTACTS, () => {
      setIsContactModalOpen(true);
      setContactModalType(CrmModalTypes.ADD_CONTACT_MODAL);
    });
  };

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addContactBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      onPrimaryButtonClick={onPrimaryButtonClick}
      isPrimaryBtnLoading={isCheckingCrmLimit}
      module={Modules.CRM}
    >
      <>
        {selectedContactId && (
          <SidePanelWrapper>
            <ContactSidePanel />
          </SidePanelWrapper>
        )}

        <ContactModalController />
        <TaskModalController />
        <ContactTable />
      </>
    </ContentLayout>
  );
};

export default Contacts;
