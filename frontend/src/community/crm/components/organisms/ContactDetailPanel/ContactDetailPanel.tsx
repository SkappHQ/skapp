import { SidePanel } from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  useGetCrmContactById,
  useGetCrmContactMetrics,
  useGetCrmContactTasks
} from "~community/crm/api/CrmContactsApi";
import ContactActionMenu from "~community/crm/components/molecules/ContactActionMenu/ContactActionMenu";
import ContactMetrics, {
  ContactMetricsSkeleton
} from "~community/crm/components/molecules/ContactMetrics/ContactMetrics";
import DealsSection from "~community/crm/components/molecules/DealsSection/DealsSection";
import DeleteContactModal from "~community/crm/components/molecules/DeleteContactModal/DeleteContactModal";
import EditContactModal from "~community/crm/components/molecules/EditContactModal/EditContactModal";
import SidePanelContactHeader from "~community/crm/components/molecules/SidePanelContactHeader/SidePanelContactHeader";
import SidePanelTabView from "~community/crm/components/molecules/SidePanelTabView/SidePanelTabView";
import SidePanelTabViewSkeleton from "~community/crm/components/molecules/SidePanelTabView/SidePanelTabViewSkeleton";
import SidePanelTasksSection from "~community/crm/components/molecules/SidePanelTasksSection/SidePanelTasksSection";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmContactMetricsType,
  CrmTaskType
} from "~community/crm/types/CommonTypes";

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

  const { data: contact, isLoading: isContactLoading } = useGetCrmContactById(
    selectedContactId ?? 0
  );
  const { data: metrics, isLoading: isMetricsLoading } =
    useGetCrmContactMetrics(selectedContactId ?? 0);

  const { data: contactTasks = [], isLoading: isTasksLoading } =
    useGetCrmContactTasks(
      selectedContactId ?? 0,
      isContactDetailPanelOpen && !!selectedContactId
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
      <div className="crm-contact-panel">
        <SidePanel
          isOpen={isContactDetailPanelOpen}
          onClose={closeContactDetailPanel}
          closeOnBackdropClick
          width="xl"
          ariaLabelledBy="contact-panel-title"
          header={
            <SidePanelContactHeader
              contact={contact ?? undefined}
              isLoading={isContactLoading}
              onCompanyClick={(companyId: any) => {
                // TODO: Open company side panel once the slice/controller is implemented
              }}
            />
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
            {/* Metrics */}
            {isMetricsLoading ? (
              <ContactMetricsSkeleton />
            ) : (
              <ContactMetrics metrics={metrics ?? DEFAULT_METRICS} />
            )}

            {/* Tabs: Tasks + Deals */}
            {selectedContactId &&
              (isContactLoading ? (
                <SidePanelTabViewSkeleton tabCount={2} />
              ) : (
                <SidePanelTabView
                  tabs={[
                    {
                      id: "tasks",
                      label: translateText(["tabs", "tasks"]),
                      content: (
                        <SidePanelTasksSection
                          tasks={contactTasks as CrmTaskType[]}
                          isLoading={isTasksLoading}
                        />
                      )
                    },
                    {
                      id: "deals",
                      label: translateText(["tabs", "deals"]),
                      content: <DealsSection contactId={selectedContactId} />
                    }
                  ]}
                />
              ))}
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
