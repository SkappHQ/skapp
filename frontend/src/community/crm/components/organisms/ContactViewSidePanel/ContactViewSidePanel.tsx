import { Box, Divider, Typography } from "@mui/material";
import {
  IconButton,
  SidePanel,
  VerticalThreeDotsIcon
} from "@rootcodelabs/skapp-ui";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  useGetCrmContactById,
  useGetCrmContactDeals,
  useGetCrmContactMetrics,
  useGetCrmContactTasks
} from "~community/crm/api/CrmContactsApi";
import ContactSidePanelSkeleton from "~community/crm/components/molecules/ContactSidePanelSkeleton/ContactSidePanelSkeleton";
import { CrmSidePanelContact } from "~community/crm/types/StoreTypes";

interface ContactViewSidePanelProps {
  contact: CrmSidePanelContact | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}m`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`;
  }
  return `$${value.toFixed(0)}`;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};

const ContactViewSidePanel = ({
  contact,
  isOpen,
  onClose
}: ContactViewSidePanelProps) => {
  const translateText = useTranslator("crmModule", "contacts");
  const [isMounted, setIsMounted] = useState(false);

  const contactId = contact?.id ?? 0;

  const { data: contactDetail, isLoading: isLoadingContact } =
    useGetCrmContactById(contactId, isOpen && contactId > 0);

  const { data: metrics, isLoading: isLoadingMetrics } =
    useGetCrmContactMetrics(contactId, isOpen && contactId > 0);

  const { data: deals, isLoading: isLoadingDeals } = useGetCrmContactDeals(
    contactId,
    isOpen && contactId > 0
  );

  const { data: tasks, isLoading: isLoadingTasks } = useGetCrmContactTasks(
    contactId,
    isOpen && contactId > 0
  );

  const isLoading =
    isLoadingContact || isLoadingMetrics || isLoadingDeals || isLoadingTasks;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const panel = (
    <SidePanel
      isOpen={isOpen}
      closeOnBackdropClick
      header={
        <div className="pl-3">
          {contact && (
            <div className="flex min-w-0 flex-col gap-1">
              <h2
                className="truncate text-base font-semibold leading-5 text-black"
                id="contact-side-panel-title"
              >
                {contactDetail?.name ?? contact.name}
              </h2>
              <span className="truncate text-sm leading-5 text-gray-500">
                {contactDetail?.company?.name ?? contact.company ?? "—"}
              </span>
            </div>
          )}
        </div>
      }
      headerActions={
        <IconButton
          icon={<VerticalThreeDotsIcon />}
          isRounded
          aria-label={translateText(["sidePanel", "moreActionsAriaLabel"])}
        />
      }
      width="lg"
      closeAriaLabel={translateText(["sidePanel", "closeAriaLabel"])}
      onClose={onClose}
    >
      {contact && isLoading && <ContactSidePanelSkeleton />}

      {contact && !isLoading && (
        <Box sx={{ p: 2 }}>
          {/* Contact Info Section */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 600, mb: 1, fontSize: "0.875rem" }}>
              Contact Information
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body2">
                  {contactDetail?.email ?? "—"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body2">
                  {contactDetail?.contactNumber ?? "—"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Company
                </Typography>
                <Typography variant="body2">
                  {contactDetail?.company?.name ?? "—"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Owner
                </Typography>
                <Typography variant="body2">
                  {contactDetail?.owner
                    ? `${contactDetail.owner.firstName} ${contactDetail.owner.lastName}`
                    : "—"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body2">
                  {contactDetail?.lastModifiedDate
                    ? formatDate(contactDetail.lastModifiedDate)
                    : "—"}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Metrics Section */}
          <Box sx={{ mb: 3 }}>
            <Typography  sx={{ fontWeight: 600, mb: 1 }}>
              Metrics
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2
              }}
            >
              <Box
                sx={{ p: 1.5, bgcolor: "success.light", borderRadius: 1 }}
              >
                <Typography variant="caption" color="text.secondary">
                  Total Revenue
                </Typography>
                <Typography variant="body1" color="success.main" sx={{ fontWeight: 600 }}>
                  {formatCurrency(metrics?.totalRevenue ?? 0)}
                </Typography>
              </Box>
              <Box
                sx={{ p: 1.5, bgcolor: "info.light", borderRadius: 1 }}
              >
                <Typography variant="caption" color="text.secondary">
                  Pipeline Revenue
                </Typography>
                <Typography variant="body1" color="info.main" sx={{ fontWeight: 600 }}>
                  {formatCurrency(metrics?.revenueOnPipeline ?? 0)}
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: "grey.100", borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Active Deals
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {metrics?.activeDealsCount ?? 0}
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: "grey.100", borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Open Tasks
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {metrics?.openTasksCount ?? 0}
                  {(metrics?.overdueTasksCount ?? 0) > 0 && (
                    <Typography
                      component="span"
                      variant="caption"
                      color="error.main"
                      sx={{ ml: 1 }}
                    >
                      ({metrics?.overdueTasksCount} overdue)
                    </Typography>
                  )}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Deals Section */}
          <Box sx={{ mb: 3 }}>
            <Typography  sx={{ fontWeight: 600, mb: 1 }}>
              Deals ({deals?.length ?? 0})
            </Typography>
            {deals && deals.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {deals.map((deal) => (
                  <Box
                    key={deal.id}
                    sx={{
                      p: 1.5,
                      bgcolor: "grey.50",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "grey.200"
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start"
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {deal.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1,
                          py: 0.5,
                          bgcolor:
                            deal.stage.name === "WON"
                              ? "success.light"
                              : deal.stage.name === "LOST"
                                ? "error.light"
                                : "info.light",
                          color:
                            deal.stage.name === "WON"
                              ? "success.dark"
                              : deal.stage.name === "LOST"
                                ? "error.dark"
                                : "info.dark",
                          borderRadius: 1
                        }}
                      >
                        {deal.stage.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      ${deal.amount}
                    </Typography>
                    {deal.closingAt && (
                      <Typography variant="caption" color="text.secondary">
                        Closing: {formatDate(deal.closingAt)}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No deals found
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Tasks Section */}
          <Box>
            <Typography  sx={{ fontWeight: 600, mb: 1 }}>
              Tasks ({tasks?.length ?? 0})
            </Typography>
            {tasks && tasks.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {tasks.map((task) => {
                  const isOverdue =
                    task.dueAt && new Date(task.dueAt) < new Date();
                  return (
                    <Box
                      key={task.id}
                      sx={{
                        p: 1.5,
                        bgcolor: "grey.50",
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "grey.200",
                        opacity: task.isCompleted ? 0.6 : 1
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start"
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            textDecoration: task.isCompleted
                              ? "line-through"
                              : "none"
                          }}
                        >
                          {task.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            px: 1,
                            py: 0.5,
                            bgcolor: "grey.200",
                            borderRadius: 1
                          }}
                        >
                          {task.type.name}
                        </Typography>
                      </Box>
                      {task.dueAt && (
                        <Typography
                          variant="caption"
                          color={isOverdue ? "error.main" : "text.secondary"}
                        >
                          Due: {formatDate(task.dueAt)}
                          {isOverdue && !task.isCompleted && " (Overdue)"}
                        </Typography>
                      )}
                      {task.notes && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          {task.notes}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No tasks found
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </SidePanel>
  );

  if (!isMounted) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1500,
        pointerEvents: "none"
      }}
    >
      <div className="crm-contact-side-panel" style={{ pointerEvents: "auto" }}>
        {panel}
      </div>
    </div>,
    document.body
  );
};

export default ContactViewSidePanel;
