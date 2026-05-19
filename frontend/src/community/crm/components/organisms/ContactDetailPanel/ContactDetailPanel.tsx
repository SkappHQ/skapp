import { Skeleton } from "@mui/material";
import { SidePanel } from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  useGetCrmContactById,
  useGetCrmContactMetrics
} from "~community/crm/api/CrmContactsApi";
import ContactActionMenu from "~community/crm/components/molecules/ContactActionMenu/ContactActionMenu";
import ContactHeader from "~community/crm/components/molecules/ContactHeader/ContactHeader";
import ContactMetrics, {
  ContactMetricsSkeleton
} from "~community/crm/components/molecules/ContactMetrics/ContactMetrics";
import DealsSection from "~community/crm/components/molecules/DealsSection/DealsSection";
import DeleteContactModal from "~community/crm/components/molecules/DeleteContactModal/DeleteContactModal";
import EditContactModal from "~community/crm/components/molecules/EditContactModal/EditContactModal";
import TasksSection from "~community/crm/components/molecules/TasksSection/TasksSection";
import { useCrmStore } from "~community/crm/store/store";
import { CrmContactMetricsType } from "~community/crm/types/CommonTypes";
import { formatLastUpdated } from "~community/crm/utils/contactHeaderUtils";

const DEFAULT_METRICS: CrmContactMetricsType = {
  totalRevenue: 0,
  revenueOnPipeline: 0,
  activeDealsCount: 0,
  openTasksCount: 0,
  overdueTasksCount: 0
};

const ContactDetailPanel: FC = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel"
  );

  const { setToastMessage } = useToast();

  const {
    isContactDetailPanelOpen,
    selectedContactId,
    closeContactDetailPanel
  } = useCrmStore();

  const { data: contact, isLoading: isContactLoading } = useGetCrmContactById(selectedContactId ?? 0);
  const { data: metrics, isLoading: isMetricsLoading } = useGetCrmContactMetrics(selectedContactId ?? 0);

  useEffect(() => {
    if (
      !isContactLoading &&
      !contact &&
      isContactDetailPanelOpen &&
      !!selectedContactId
    ) {
      setToastMessage({
        open: true,
        toastType: "error",
        title: translateText(["errors", "contactNotFoundTitle"]),
        description: translateText(["errors", "contactNotFoundDescription"]),
        isIcon: true
      });
      closeContactDetailPanel();
    }
  }, [isContactLoading, contact, isContactDetailPanelOpen, selectedContactId]);

  return (
    <>
      <div className="crm-contact-panel">
        <SidePanel
          isOpen={isContactDetailPanelOpen}
          onClose={closeContactDetailPanel}
          closeOnBackdropClick
          width="xl max-w-[1100px]"
          ariaLabelledBy="contact-panel-title"
          header={
            isContactLoading ? (
              <div className="flex flex-col gap-[8px]">
                <Skeleton width={180} height={28} animation="wave" />
                <Skeleton width={120} height={16} animation="wave" />
              </div>
            ) : (
              <div
                id="contact-panel-title"
                className="flex flex-col gap-[8px] items-start"
              >
                <p className="font-bold text-[24px] leading-[24px] tracking-[0.0703px] text-black">
                  {contact?.name ?? ""}
                </p>
                <p className="font-normal text-[14px] leading-[1.5] text-[#4a5565]">
                  {translateText(["lastUpdated"])} :{" "}
                  {formatLastUpdated(contact?.lastContactedAt ?? null)}
                </p>
              </div>
            )
          }
          headerActions={
            <ContactActionMenu
              editLabel={translateText(["menu", "editContact"])}
              deleteLabel={translateText(["menu", "deleteContact"])}
              onEdit={() => setIsEditModalOpen(true)}
              onDelete={() => setIsDeleteModalOpen(true)}
            />
          }
        >
          <div className="flex flex-col gap-6 pb-4">
            {/* Contact info */}
            <ContactHeader
              contact={contact ?? undefined}
              isLoading={isContactLoading}
            />

            {/* Metrics */}
            {isMetricsLoading ? (
              <ContactMetricsSkeleton />
            ) : (
              <ContactMetrics metrics={metrics ?? DEFAULT_METRICS} />
            )}

            {/* Tasks */}
            {selectedContactId && (
              <TasksSection contactId={selectedContactId} />
            )}

            {/* Deals */}
            {selectedContactId && (
              <DealsSection contactId={selectedContactId} />
            )}
          </div>
        </SidePanel>
      </div>

      {/* Edit contact modal */}
      {contact && (
        <EditContactModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          contact={contact}
        />
      )}

      {/* Delete contact modal */}
      {contact && (
        <DeleteContactModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          contact={contact}
          onDeleted={() => {
            setIsDeleteModalOpen(false);
            closeContactDetailPanel();
          }}
        />
      )}
    </>
  );
};

export default ContactDetailPanel;
