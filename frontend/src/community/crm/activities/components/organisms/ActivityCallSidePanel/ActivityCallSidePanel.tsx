import { SidePanel } from "@rootcodelabs/skapp-ui";
import { FC, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useGetCallById } from "~community/crm/api/ActivityApi";
import SidePanelHeaderActionsSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelHeaderActionsSkeleton";
import SidePanelHeaderSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelHeaderSkeleton";
import CallSidePanel from "~community/crm/components/organisms/CallSidePanel/CallSidePanel";
import TaskSidePanelSkeleton from "~community/crm/components/organisms/TaskSidePanel/TaskSidePanelSkeleton";
import { useCrmStore } from "~community/crm/store/store";
import { updateCompanyRecord } from "~community/crm/utils/companyUtil";
import { updateContactRecord } from "~community/crm/utils/contactUtil";
import { mergeDeals } from "~community/crm/utils/dealUtil";

interface Props {
  callId: number;
  onClose: () => void;
}

const ActivityCallSidePanel: FC<Props> = ({ callId, onClose }) => {
  const translateText = useTranslator("crmModule");
  const { setToastMessage } = useToast();

  const { contacts, companies, deals, setContacts, setCompanies, setDeals } =
    useCrmStore(
      useShallow((store) => ({
        contacts: store.contacts,
        companies: store.companies,
        deals: store.deals,
        setContacts: store.setContacts,
        setCompanies: store.setCompanies,
        setDeals: store.setDeals
      }))
    );

  const { data: call, isError } = useGetCallById(callId, true);

  useEffect(() => {
    if (!call) return;

    if (call.contact)
      setContacts(updateContactRecord(contacts, [call.contact]));
    if (call.company)
      setCompanies(updateCompanyRecord(companies, [call.company]));
    if (call.deal) setDeals(mergeDeals(deals, [call.deal]));
  }, [call]);

  useEffect(() => {
    if (!isError) return;

    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText([
        "activities",
        "callSidePanel",
        "toasts",
        "loadErrorTitle"
      ]),
      description: translateText([
        "activities",
        "callSidePanel",
        "toasts",
        "loadErrorDescription"
      ]),
      isIcon: true
    });
    onClose();
  }, [isError]);

  if (!call) {
    return (
      <SidePanel
        isOpen
        onClose={onClose}
        closeOnBackdropClick
        header={<SidePanelHeaderSkeleton isShowLastUpdate={false} />}
        headerActions={<SidePanelHeaderActionsSkeleton />}
      >
        <div aria-busy="true">
          <TaskSidePanelSkeleton />
        </div>
      </SidePanel>
    );
  }

  return (
    <CallSidePanel
      call={{
        id: call.id,
        subject: call.subject,
        ownerId: call.ownerId,
        ...(call.loggedAt ? { startAt: call.loggedAt } : {}),
        ...(call.comments ? { comments: call.comments } : {}),
        ...(call.durationMinutes !== null
          ? { durationMinutes: call.durationMinutes }
          : {}),
        ...(call.contact && call.contact.id
          ? { contactId: call.contact.id }
          : {}),
        ...(call.deal && call.deal.id ? { dealId: call.deal.id } : {}),
        ...(call.company && call.company.id
          ? { companyId: call.company.id }
          : {})
      }}
      isOpen
      onClose={onClose}
    />
  );
};

export default ActivityCallSidePanel;
