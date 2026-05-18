import { Skeleton } from "@mui/material";
import { FC, useEffect } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  useGetContactById,
  useGetContactMetrics
} from "~community/crm/api/CrmApi";
import ContactHeader from "~community/crm/components/molecules/ContactHeader/ContactHeader";
import ContactMetrics, {
  ContactMetricsSkeleton
} from "~community/crm/components/molecules/ContactMetrics/ContactMetrics";
import DealsSection from "~community/crm/components/molecules/DealsSection/DealsSection";
import DeleteContactModal from "~community/crm/components/molecules/DeleteContactModal/DeleteContactModal";
import EditContactModal from "~community/crm/components/molecules/EditContactModal/EditContactModal";
import TasksSection from "~community/crm/components/molecules/TasksSection/TasksSection";
import { useCrmStore } from "~community/crm/store/store";
import { CrmContactMetricsType } from "~community/crm/types/CrmContactTypes";

const DEFAULT_METRICS: CrmContactMetricsType = {
  totalRevenue: 0,
  revenueOnPipeline: 0,
  activeDealsCount: 0,
  openTasksCount: 0,
  overdueTasksCount: 0
};

interface ContactDetailPanelProps {
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  onCloseEditModal: () => void;
  onCloseDeleteModal: () => void;
}

const ContactDetailPanel: FC<ContactDetailPanelProps> = ({
  isEditModalOpen,
  isDeleteModalOpen,
  onCloseEditModal,
  onCloseDeleteModal
}) => {
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

  const { data: contact, isLoading: isContactLoading } = useGetContactById(
    selectedContactId ?? 0
  );
  const { data: metrics, isLoading: isMetricsLoading } = useGetContactMetrics(
    selectedContactId ?? 0
  );

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
      <div className="flex flex-col gap-6 pb-4">
        {/* Contact info */}
        {isContactLoading ? (
          <div className="flex flex-col gap-1">
            <Skeleton width="60%" height={20} animation="wave" />
            <Skeleton width="80%" height={20} animation="wave" />
            <Skeleton width="70%" height={20} animation="wave" />
          </div>
        ) : contact ? (
          <ContactHeader contact={contact} />
        ) : null}

        {/* Metrics */}
        {isMetricsLoading ? (
          <ContactMetricsSkeleton />
        ) : (
          <ContactMetrics metrics={metrics ?? DEFAULT_METRICS} />
        )}

        {/* Deals */}
        {selectedContactId && (
          <DealsSection contactId={selectedContactId} />
        )}

        {/* Tasks */}
        {selectedContactId && (
          <TasksSection contactId={selectedContactId} />
        )}
      </div>

      {/* Edit contact modal */}
      {contact && (
        <EditContactModal
          isOpen={isEditModalOpen}
          onClose={onCloseEditModal}
          contact={contact}
        />
      )}

      {/* Delete contact modal */}
      {contact && (
        <DeleteContactModal
          isOpen={isDeleteModalOpen}
          onClose={onCloseDeleteModal}
          contact={contact}
          onDeleted={() => {
            onCloseDeleteModal();
            closeContactDetailPanel();
          }}
        />
      )}
    </>
  );
};

export default ContactDetailPanel;
