import { NextPage } from "next";
import CrmLayout from "~community/common/components/templates/CrmLayout/CrmLayout";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import SidePanelWrapper from "~community/crm/components/atoms/SidePanelWrapper/SidePanelWrapper";
import ContactModalController from "~community/crm/components/organisms/ContactModalController/ContactModalController";
import ContactSidePanel from "~community/crm/components/organisms/ContactSidePanel/ContactSidePanel";
import { ContactTable } from "~community/crm/components/organisms/ContactTable/ContactTable";
import TaskModalController from "~community/crm/components/organisms/TaskModalController/TaskModalController";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import CrmLimitModalController from "~enterprise/crm/components/organisms/CrmLimitModalController/CrmLimitModalController";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

const Contacts: NextPage = () => {
  const translateText = useTranslator("crmModule", "contacts");
  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const {
    isCrmSidePanelOpen,
    setIsCrmSidePanelOpen,
    setSelectedContactId,
    setIsContactModalOpen,
    setContactModalType,
    selectedContactId
  } = useCrmStore((store) => ({
    isCrmSidePanelOpen: store.isCrmSidePanelOpen,
    setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen,
    setSelectedContactId: store.setSelectedContactId,
    setIsContactModalOpen: store.setIsContactModalOpen,
    setContactModalType: store.setContactModalType,
    selectedContactId: store.selectedContactId
  }));

  const handleCloseSidePanel = () => {
    setIsCrmSidePanelOpen(false);
    setSelectedContactId(null);
  };

  const onPrimaryButtonClick = () => {
    guardCrmCreate(CrmLimitResource.CONTACTS, () => {
      setIsContactModalOpen(true);
      setContactModalType(CrmModalTypes.ADD_CONTACT_MODAL);
    });
  };

  return (
    <CrmLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addContactBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      onPrimaryButtonClick={onPrimaryButtonClick}
      isPrimaryBtnLoading={isCheckingCrmLimit}
    >
      <>
        {selectedContactId && (
          <SidePanelWrapper>
            <ContactSidePanel
              isOpen={isCrmSidePanelOpen}
              onClose={handleCloseSidePanel}
            />
          </SidePanelWrapper>
        )}

        <ContactModalController />
        <TaskModalController />
        <ContactTable />
      </>
    </CrmLayout>
  );
};

export default Contacts;
