import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useQueryClient } from "@tanstack/react-query";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import Table from "~community/common/components/molecules/Table/Table";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  googleWorkspaceQueryKeys,
  useApproveStaging,
  useGetStagingRecords,
  useTriggerBulkSync
} from "~community/people/api/GoogleWorkspaceSyncApi";
import {
  GoogleAccountStatus,
  StagingChangeType,
  StagingRecord
} from "~community/people/types/GoogleWorkspaceSyncTypes";

const STAGING_QUERY_REFETCH_MS = 5000;
const SYNC_INVALIDATE_DELAY_MS = 5000;

type SectionKey = "new" | "suspended" | "updated" | "removed";

interface StatusPillConfig {
  label: string;
  bg: string;
  color: string;
  dot: string;
}

interface SectionTableProps {
  sectionKey: SectionKey;
  dotColor: string;
  titleLabel: string;
  actionLabel: string;
  partialActionLabel: (selectedCount: number) => string;
  emptyLabel: string;
  records: StagingRecord[];
  isActing: boolean;
  statusPill: StatusPillConfig;
  onAction: (ids: number[]) => void;
}

const SectionTable = ({
  sectionKey,
  dotColor,
  titleLabel,
  actionLabel,
  partialActionLabel,
  emptyLabel,
  records,
  isActing,
  statusPill,
  onAction
}: SectionTableProps) => {
  const theme = useTheme();
  const translateText = useTranslator("peopleModule", "peoples");
  const [selected, setSelected] = useState<number[]>(() =>
    records.map((r) => r.id)
  );

  const knownIds = useMemo(() => records.map((r) => r.id), [records]);
  const validSelected = selected.filter((id) => knownIds.includes(id));
  const allSelected =
    knownIds.length > 0 && validSelected.length === knownIds.length;

  const toggleOne = (id: number) => () => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelected(allSelected ? [] : knownIds);
  };

  const rows = records.map((record) => ({
    id: record.id,
    ariaLabel: {
      row: `${record.firstName} ${record.lastName}`,
      checkbox: `${record.firstName} ${record.lastName}`
    },
    name: (
      <Stack direction="row" alignItems="center" gap="0.5rem">
        <AvatarChip
          firstName={record.firstName || record.email.charAt(0).toUpperCase()}
          lastName={record.lastName || ""}
          avatarUrl={record.photoUrl}
          isResponsiveLayout
          chipStyles={{
            maxWidth: "14.75rem",
            minWidth: 0,
            width: "fit-content",
            "& .MuiChip-label": { pr: "0.3rem" },
            justifyContent: "flex-start"
          }}
        />
      </Stack>
    ),
    email: (
      <Typography variant="body2" color="text.secondary">
        {record.email}
      </Typography>
    ),
    status: (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          px: "0.625rem",
          py: "0.25rem",
          borderRadius: "999px",
          backgroundColor: statusPill.bg,
          color: statusPill.color,
          fontWeight: 600,
          fontSize: "0.75rem"
        }}
      >
        {statusPill.label}
      </Box>
    )
  }));

  // Match the same wrapper/table styling PeopleTable uses on the Directory
  // page (grey surface, rounded 0.625rem head/container, borderless header
  // cells) so this page's tables look like the rest of the app's tables.
  const tableHeadStyles = {
    borderTopLeftRadius: "0.625rem",
    borderTopRightRadius: "0.625rem"
  };
  const tableHeaderCellStyles = { border: "none" };
  const tableContainerStyles = { borderRadius: "0.625rem", overflow: "auto" };

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.grey[100],
        display: "flex",
        flexDirection: "column",
        borderRadius: "0.5rem",
        gap: "0.125rem",
        mb: "1.5rem"
      }}
    >
      <Table
        tableName={`google-workspace-sync-${sectionKey}`}
        headers={[
          { id: "name", label: translateText(["googleWorkspaceSync", "columnName"]) },
          { id: "email", label: translateText(["googleWorkspaceSync", "columnEmail"]) },
          { id: "status", label: translateText(["googleWorkspaceSync", "columnStatus"]) }
        ]}
        rows={rows}
        selectedRows={validSelected}
        checkboxSelection={{
          isEnabled: true,
          isSelectAllEnabled: true,
          isSelectAllVisible: true,
          isSelectAllChecked: allSelected,
          handleIndividualSelectClick: toggleOne,
          handleSelectAllClick: toggleAll
        }}
        customStyles={{
          wrapper: { overflow: "hidden" },
          container: tableContainerStyles
        }}
        tableHead={{
          customStyles: { row: tableHeadStyles, cell: tableHeaderCellStyles }
        }}
        actionToolbar={{
          firstRow: {
            leftButton: (
              <Stack direction="row" alignItems="center" gap="0.5rem">
                <Box
                  sx={{
                    width: "0.6rem",
                    height: "0.6rem",
                    borderRadius: "50%",
                    backgroundColor: dotColor,
                    flexShrink: 0
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600, color: dotColor }}>
                  {titleLabel}
                </Typography>
              </Stack>
            ),
            rightButton:
              records.length > 0 ? (
                <ButtonV2
                  variant="primary"
                  size="sm"
                  isLoading={isActing}
                  disabled={validSelected.length === 0}
                  onClick={() => onAction(validSelected)}
                  style={{ minWidth: "9rem" }}
                >
                  {allSelected
                    ? actionLabel
                    : partialActionLabel(validSelected.length)}
                </ButtonV2>
              ) : undefined
          }
        }}
        tableBody={{
          emptyState: {
            noData: { title: emptyLabel }
          }
        }}
      />
    </Box>
  );
};

const SyncChanges: NextPage = () => {
  const theme = useTheme();
  const router = useRouter();
  const translateText = useTranslator("peopleModule", "peoples");
  const { setToastMessage } = useToast();
  const queryClient = useQueryClient();

  const [actingSection, setActingSection] = useState<SectionKey | null>(null);

  const { data: stagingRecords, isLoading } = useGetStagingRecords({
    refetchInterval: STAGING_QUERY_REFETCH_MS
  });
  const { mutate: triggerBulkSync, isPending: isSyncing } = useTriggerBulkSync();
  const { mutate: approveStaging } = useApproveStaging();

  const allRecords = useMemo(() => stagingRecords ?? [], [stagingRecords]);

  const newMembers = useMemo(
    () => allRecords.filter((r) => r.changeType === StagingChangeType.NEW),
    [allRecords]
  );
  const suspended = useMemo(
    () =>
      allRecords.filter(
        (r) =>
          r.changeType === StagingChangeType.UPDATED &&
          r.googleStatus === GoogleAccountStatus.SUSPENDED
      ),
    [allRecords]
  );
  const updated = useMemo(
    () =>
      allRecords.filter(
        (r) =>
          r.changeType === StagingChangeType.UPDATED &&
          r.googleStatus !== GoogleAccountStatus.SUSPENDED
      ),
    [allRecords]
  );
  const removed = useMemo(
    () => allRecords.filter((r) => r.changeType === StagingChangeType.REMOVED),
    [allRecords]
  );

  const totalPending = allRecords.length;
  const lastSyncedAt = allRecords[0]?.syncedAt;

  const formatLastSynced = (iso: string | undefined) => {
    if (!iso) return null;
    const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (minutes < 1) return translateText(["googleWorkspaceSync", "lastSyncedJustNow"]);
    if (minutes < 60)
      return translateText(["googleWorkspaceSync", "lastSyncedMinutes"], { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24)
      return translateText(["googleWorkspaceSync", "lastSyncedHours"], { count: hours });
    return translateText(["googleWorkspaceSync", "lastSyncedDays"], {
      count: Math.floor(hours / 24)
    });
  };

  const handleAction = (section: SectionKey, ids: number[]) => {
    if (ids.length === 0) return;
    setActingSection(section);
    approveStaging(ids, {
      onSuccess: () => {
        setActingSection(null);
      },
      onError: () => {
        setActingSection(null);
        setToastMessage({
          open: true,
          toastType: ToastType.ERROR,
          title: translateText(["googleWorkspaceSync", "actionErrorTitle"]),
          description: translateText(["googleWorkspaceSync", "actionErrorDescription"])
        });
      }
    });
  };

  // The backend doesn't yet support permanently deleting an employee record
  // (as opposed to approving/terminating), so this action is a visual stub
  // for now — it deliberately does not call the staging approve endpoint.
  const handleRemoveFromSkapp = (_ids: number[]) => {
    setToastMessage({
      open: true,
      toastType: ToastType.INFO,
      title: translateText(["googleWorkspaceSync", "removeNotAvailableTitle"]),
      description: translateText([
        "googleWorkspaceSync",
        "removeNotAvailableDescription"
      ])
    });
  };

  const handleSyncAgain = () => {
    triggerBulkSync(undefined, {
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey: googleWorkspaceQueryKeys.STAGING_RECORDS
          });
        }, SYNC_INVALIDATE_DELAY_MS);
      }
    });
  };

  const newStatusPill: StatusPillConfig = {
    label: translateText(["googleWorkspaceSync", "statusNew"]),
    bg: theme.palette.greens.lightBackground,
    color: theme.palette.greens.midDark,
    dot: theme.palette.greens.midDark
  };
  const suspendedStatusPill: StatusPillConfig = {
    label: translateText(["googleWorkspaceSync", "statusSuspended"]),
    bg: theme.palette.amber.mid,
    color: theme.palette.amber.dark,
    dot: theme.palette.amber.main
  };
  const updatedStatusPill: StatusPillConfig = {
    label: translateText(["googleWorkspaceSync", "statusUpdated"]),
    bg: theme.palette.info.light,
    color: theme.palette.info.dark,
    dot: theme.palette.info.main
  };
  const removedStatusPill: StatusPillConfig = {
    label: translateText(["googleWorkspaceSync", "statusRemoved"]),
    bg: theme.palette.error.main,
    color: theme.palette.text.darkerText as string,
    dot: theme.palette.text.darkerText as string
  };

  return (
    <ContentLayout
      pageHead={translateText(["googleWorkspaceSync", "pageHead"])}
      title={translateText(["googleWorkspaceSync", "pageTitle"])}
      breadcrumbs={[
        { label: translateText(["title"]) },
        { label: translateText(["googleWorkspaceSync", "pageTitle"]) }
      ]}
      customRightContent={
        <Stack direction="row" gap="1rem" alignItems="center">
          {lastSyncedAt && (
            <Typography variant="body2" color="text.secondary">
              {translateText(["googleWorkspaceSync", "lastSyncedLabel"], {
                time: formatLastSynced(lastSyncedAt)
              })}
            </Typography>
          )}
          <ButtonV2
            variant="tertiary"
            size="sm"
            isLoading={isSyncing}
            onClick={handleSyncAgain}
          >
            {translateText(["googleWorkspaceSync", "syncNowButton"])}
          </ButtonV2>
        </Stack>
      }
      isDividerVisible
    >
      <Box sx={{ py: "1.25rem" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: "4rem" }}>
            <Typography variant="body2" color="text.secondary">
              {translateText(["googleWorkspaceSync", "loadingChanges"])}
            </Typography>
          </Box>
        ) : totalPending === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: "4rem",
              textAlign: "center"
            }}
          >
            <Box
              sx={{
                width: "3.5rem",
                height: "3.5rem",
                borderRadius: "50%",
                backgroundColor: theme.palette.greens.lightBackground,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: "1rem",
                fontSize: "1.5rem",
                color: theme.palette.greens.midDark
              }}
            >
              ✓
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: "0.5rem" }}>
              {translateText(["googleWorkspaceSync", "upToDateTitle"])}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: "1.5rem" }}>
              {translateText(["googleWorkspaceSync", "upToDateDescription"])}
            </Typography>
            <ButtonV2
              variant="tertiary"
              size="sm"
              isLoading={isSyncing}
              onClick={handleSyncAgain}
            >
              {translateText(["googleWorkspaceSync", "checkForChangesButton"])}
            </ButtonV2>
          </Box>
        ) : (
          <>
            {newMembers.length > 0 && (
              <SectionTable
                sectionKey="new"
                dotColor={newStatusPill.dot}
                titleLabel={translateText(
                  ["googleWorkspaceSync", "newMembersHeading"],
                  { count: newMembers.length }
                )}
                actionLabel={translateText(
                  ["googleWorkspaceSync", "importAllLabel"],
                  { count: newMembers.length }
                )}
                partialActionLabel={(count) =>
                  translateText(
                    ["googleWorkspaceSync", "importSelectedLabel"],
                    { count }
                  )
                }
                emptyLabel={translateText(["googleWorkspaceSync", "noNewMembers"])}
                records={newMembers}
                isActing={actingSection === "new"}
                statusPill={newStatusPill}
                onAction={(ids) => handleAction("new", ids)}
              />
            )}

            {suspended.length > 0 && (
              <SectionTable
                sectionKey="suspended"
                dotColor={suspendedStatusPill.dot}
                titleLabel={translateText(
                  ["googleWorkspaceSync", "suspendedHeading"],
                  { count: suspended.length }
                )}
                actionLabel={translateText(["googleWorkspaceSync", "terminateInSkappLabel"])}
                partialActionLabel={(count) =>
                  translateText(
                    ["googleWorkspaceSync", "terminateSelectedLabel"],
                    { count }
                  )
                }
                emptyLabel={translateText(["googleWorkspaceSync", "noSuspended"])}
                records={suspended}
                isActing={actingSection === "suspended"}
                statusPill={suspendedStatusPill}
                onAction={(ids) => handleAction("suspended", ids)}
              />
            )}

            {updated.length > 0 && (
              <SectionTable
                sectionKey="updated"
                dotColor={updatedStatusPill.dot}
                titleLabel={translateText(
                  ["googleWorkspaceSync", "updatedHeading"],
                  { count: updated.length }
                )}
                actionLabel={translateText(["googleWorkspaceSync", "updateInSkappLabel"])}
                partialActionLabel={(count) =>
                  translateText(
                    ["googleWorkspaceSync", "updateSelectedLabel"],
                    { count }
                  )
                }
                emptyLabel={translateText(["googleWorkspaceSync", "noUpdated"])}
                records={updated}
                isActing={actingSection === "updated"}
                statusPill={updatedStatusPill}
                onAction={(ids) => handleAction("updated", ids)}
              />
            )}

            {removed.length > 0 && (
              <SectionTable
                sectionKey="removed"
                dotColor={removedStatusPill.dot}
                titleLabel={translateText(
                  ["googleWorkspaceSync", "removedHeading"],
                  { count: removed.length }
                )}
                actionLabel={translateText(["googleWorkspaceSync", "removeFromSkappLabel"])}
                partialActionLabel={(count) =>
                  translateText(
                    ["googleWorkspaceSync", "removeSelectedLabel"],
                    { count }
                  )
                }
                emptyLabel={translateText(["googleWorkspaceSync", "noRemoved"])}
                records={removed}
                isActing={false}
                statusPill={removedStatusPill}
                onAction={handleRemoveFromSkapp}
              />
            )}
          </>
        )}

        <ButtonV2
          variant="tertiary"
          size="sm"
          onClick={() => router.push(ROUTES.PEOPLE.DIRECTORY)}
        >
          {translateText(["cancelButton"])}
        </ButtonV2>
      </Box>
    </ContentLayout>
  );
};

export default SyncChanges;
