import { Box, Checkbox, Divider, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import SearchBox from "~community/common/components/molecules/SearchBox/SearchBox";
import Table from "~community/common/components/molecules/Table/Table";
import Modal from "~community/common/components/organisms/Modal/Modal";
import ROUTES from "~community/common/constants/routes";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import {
  useApproveStaging,
  useGetStagingRecords,
  useTriggerBulkSync
} from "~community/people/api/GoogleWorkspaceSyncApi";
import {
  StagingChangeType,
  StagingRecord
} from "~community/people/types/GoogleWorkspaceSyncTypes";

const STAGING_POLL_INTERVAL_MS = 4000;
const OU_DOT_COLORS = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6"
];

const ouDisplayName = (path?: string): string => {
  if (!path) return "Unknown";
  const parts = path.split("/").filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : "Unknown";
};

const StepIndicator = ({ current }: { current: 0 | 1 | 2 }) => {
  const theme = useTheme();
  const translateText = useTranslator("peopleModule", "peoples");
  const steps = [
    translateText(["googleWorkspaceImport", "stepConnect"]),
    translateText(["googleWorkspaceImport", "stepReview"]),
    translateText(["googleWorkspaceImport", "stepImport"])
  ];

  return (
    <Stack direction="row" alignItems="center">
      {steps.map((label, i) => {
        const isDone = i < current;
        const isActive = i === current;

        return (
          <Stack key={label} direction="row" alignItems="center">
            <Stack direction="row" alignItems="center" gap="0.5rem">
              <Box
                sx={{
                  width: "1.75rem",
                  height: "1.75rem",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  flexShrink: 0,
                  border: isActive
                    ? "none"
                    : `0.0938rem solid ${theme.palette.grey[300]}`,
                  backgroundColor: isActive
                    ? theme.palette.primary.main
                    : theme.palette.common.white,
                  color: isActive
                    ? theme.palette.common.white
                    : theme.palette.grey[500]
                }}
              >
                {isDone ? (
                  <Icon
                    name={IconName.CHECK_ICON}
                    fill={theme.palette.grey[500]}
                    svgProps={{ style: { width: "0.75rem", height: "0.75rem" } }}
                  />
                ) : (
                  i + 1
                )}
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isActive ? 700 : 500,
                  color: isActive
                    ? theme.palette.primary.main
                    : theme.palette.grey[500],
                  whiteSpace: "nowrap",
                  fontSize: "0.85rem"
                }}
              >
                {label}
              </Typography>
            </Stack>
            {i < steps.length - 1 && (
              <Box
                sx={{
                  width: "2.5rem",
                  height: 0,
                  mx: "0.625rem",
                  flexShrink: 0,
                  borderTop: `0.125rem dashed ${theme.palette.grey[300]}`
                }}
              />
            )}
          </Stack>
        );
      })}
    </Stack>
  );
};

const ToggleSwitch = ({
  on,
  onChange
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) => {
  const theme = useTheme();
  return (
    <Box
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      sx={{
        flexShrink: 0,
        width: "2.5rem",
        height: "1.375rem",
        borderRadius: "999px",
        backgroundColor: on ? theme.palette.greens.midDark : theme.palette.grey[300],
        position: "relative",
        cursor: "pointer",
        transition: "background-color 0.2s"
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "0.1875rem",
          left: on ? "calc(100% - 1.1875rem)" : "0.1875rem",
          width: "1rem",
          height: "1rem",
          borderRadius: "50%",
          backgroundColor: theme.palette.common.white,
          transition: "left 0.2s",
          boxShadow: "0 0.0625rem 0.1875rem rgba(0,0,0,.25)"
        }}
      />
    </Box>
  );
};

const ReviewPage: NextPage = () => {
  const router = useRouter();
  const theme = useTheme();
  const translateText = useTranslator("peopleModule", "peoples");
  const { setToastMessage } = useToast();

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [checkedOus, setCheckedOus] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  const [autoSyncNew, setAutoSyncNew] = useState(true);
  const [notifyRemovals, setNotifyRemovals] = useState(true);

  const [hasTriggeredSync, setHasTriggeredSync] = useState(false);

  // Never block the page behind a loading screen — the table below shows
  // its own lightweight loading/empty state. Poll continuously in the
  // background (no on/off gate, no timeout) so whenever data lands —
  // whether it was already there or a sync is still catching up — it just
  // appears in place.
  const {
    data: stagingRecords,
    isLoading,
    isError: isStagingError
  } = useGetStagingRecords({
    refetchInterval: STAGING_POLL_INTERVAL_MS
  });
  const { mutate: triggerBulkSync } = useTriggerBulkSync();
  const { mutate: approveStaging, isPending: isImporting } = useApproveStaging();

  const allRecords: StagingRecord[] = useMemo(
    () =>
      (stagingRecords ?? []).filter(
        (r) => r.changeType === StagingChangeType.NEW
      ),
    [stagingRecords]
  );

  // If the table is genuinely empty on the very first load, kick off a sync
  // once — but this never gates what's rendered, it just fills the table in
  // once the poll above picks up the result.
  useEffect(() => {
    if (isLoading || hasTriggeredSync) return;
    if (allRecords.length === 0) {
      setHasTriggeredSync(true);
      triggerBulkSync();
    }
  }, [isLoading, allRecords.length, hasTriggeredSync, triggerBulkSync]);

  useEffect(() => {
    const ouSet = new Set(allRecords.map((r) => r.orgUnitPath ?? "Unknown"));
    setCheckedOus(ouSet);
    setSelected(new Set(allRecords.map((r) => r.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRecords.length]);

  const allOus = useMemo((): string[] => {
    const s = new Set(allRecords.map((r) => r.orgUnitPath ?? "Unknown"));
    return Array.from(s).sort();
  }, [allRecords]);

  const visibleRecords = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allRecords.filter((r) => {
      const ou = r.orgUnitPath ?? "Unknown";
      if (!checkedOus.has(ou)) return false;
      if (!q) return true;
      return (
        r.email.toLowerCase().includes(q) ||
        `${r.firstName} ${r.lastName}`.toLowerCase().includes(q)
      );
    });
  }, [allRecords, checkedOus, search]);

  const ouCounts = useMemo((): Record<string, number> => {
    const map: Record<string, number> = {};
    for (const r of allRecords) {
      const ou = r.orgUnitPath ?? "Unknown";
      map[ou] = (map[ou] ?? 0) + 1;
    }
    return map;
  }, [allRecords]);

  const totalCount = allRecords.length;
  const selectedCount = selected.size;

  const allOusChecked =
    allOus.length > 0 && allOus.every((ou) => checkedOus.has(ou));
  const someOusChecked = allOus.some((ou) => checkedOus.has(ou));

  const allVisibleSelected =
    visibleRecords.length > 0 && visibleRecords.every((r) => selected.has(r.id));

  const toggleOu = (ou: string) => {
    setCheckedOus((prev) => {
      const next = new Set(prev);
      const membersOfOu = allRecords.filter(
        (r) => (r.orgUnitPath ?? "Unknown") === ou
      );
      if (next.has(ou)) {
        next.delete(ou);
        setSelected((sel) => {
          const ns = new Set(sel);
          membersOfOu.forEach((r) => ns.delete(r.id));
          return ns;
        });
      } else {
        next.add(ou);
        setSelected((sel) => {
          const ns = new Set(sel);
          membersOfOu.forEach((r) => ns.add(r.id));
          return ns;
        });
      }
      return next;
    });
  };

  const toggleAllOus = () => {
    if (allOusChecked) {
      setCheckedOus(new Set());
      setSelected(new Set());
    } else {
      setCheckedOus(new Set(allOus));
      setSelected(new Set(allRecords.map((r) => r.id)));
    }
  };

  const toggleSelectAll = () => {
    const next = new Set(selected);
    if (allVisibleSelected) {
      visibleRecords.forEach((r) => next.delete(r.id));
    } else {
      visibleRecords.forEach((r) => next.add(r.id));
    }
    setSelected(next);
  };

  const toggleOne = (id: number) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const selectedByOu = useMemo((): Record<string, number> => {
    const map: Record<string, number> = {};
    for (const r of allRecords) {
      if (selected.has(r.id)) {
        const ou = ouDisplayName(r.orgUnitPath);
        map[ou] = (map[ou] ?? 0) + 1;
      }
    }
    return map;
  }, [allRecords, selected]);

  const handleConfirmImport = () => {
    const ids = Array.from(selected);
    approveStaging(ids, {
      onSuccess: () => {
        setImportedCount(ids.length);
        setShowConfirmDialog(false);
        setShowSuccessDialog(true);
      },
      onError: () => {
        setToastMessage({
          open: true,
          toastType: ToastType.ERROR,
          title: translateText(["googleWorkspaceImport", "importErrorTitle"]),
          description: translateText([
            "googleWorkspaceImport",
            "importErrorDescription"
          ])
        });
      }
    });
  };

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 1300,
          backgroundColor: theme.palette.common.white,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: "1.5rem",
            py: "0.875rem",
            borderBottom: `0.0625rem solid ${theme.palette.grey[200]}`,
            flexShrink: 0
          }}
        >
          <Tooltip title={translateText(["googleWorkspaceImport", "exitTooltip"])}>
            <IconButton
              onClick={() => setShowExitDialog(true)}
              aria-label={translateText(["googleWorkspaceImport", "exitTooltip"])}
              sx={{ padding: 0, borderRadius: "0.25rem" }}
            >
              <Icon name={IconName.CLOSE_STATUS_POPUP_ICON} />
            </IconButton>
          </Tooltip>

          <Box sx={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
            <StepIndicator current={1} />
          </Box>

          <Box sx={{ width: "2.25rem" }} />
        </Box>

        <Box
          sx={{
            px: "1.5rem",
            py: "1rem",
            borderBottom: `0.0625rem solid ${theme.palette.grey[200]}`,
            flexShrink: 0
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: "0.25rem" }}>
            {translateText(["googleWorkspaceImport", "reviewTitle"])}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {translateText(["googleWorkspaceImport", "reviewSubtitlePrefix"])}{" "}
            <Box component="span" sx={{ fontWeight: 700, color: theme.palette.text.textDarkGrey }}>
              {totalCount}
            </Box>{" "}
            {translateText(["googleWorkspaceImport", "reviewSubtitleMiddle"])}{" "}
            <Box component="span" sx={{ fontWeight: 700, color: theme.palette.text.textDarkGrey }}>
              {allOus.length}
            </Box>{" "}
            {translateText(["googleWorkspaceImport", "reviewSubtitleSuffix"])}
          </Typography>
        </Box>

        <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <Box
            sx={{
              width: "16.25rem",
              flexShrink: 0,
              borderRight: `0.0625rem solid ${theme.palette.grey[200]}`,
              display: "flex",
              flexDirection: "column",
              overflowY: "auto"
            }}
          >
            <Box sx={{ px: "1rem", py: "0.75rem", borderBottom: `0.0625rem solid ${theme.palette.grey[100]}` }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.secondary,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase"
                }}
              >
                {translateText(["googleWorkspaceImport", "organizationalUnits"])}
              </Typography>
            </Box>

            <Box
              onClick={toggleAllOus}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                px: "1rem",
                py: "0.625rem",
                cursor: "pointer",
                "&:hover": { backgroundColor: theme.palette.grey[100] },
                borderBottom: `0.0625rem solid ${theme.palette.grey[100]}`
              }}
            >
              <Checkbox
                size="small"
                checked={allOusChecked}
                indeterminate={someOusChecked && !allOusChecked}
                onChange={toggleAllOus}
                onClick={(e) => e.stopPropagation()}
                sx={{ p: 0, color: theme.palette.primary.main }}
              />
              <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
                {translateText(["googleWorkspaceImport", "allMembers"])}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  backgroundColor: theme.palette.grey[100],
                  px: "0.5rem",
                  py: "0.15rem",
                  borderRadius: "999px",
                  fontWeight: 600
                }}
              >
                {totalCount}
              </Typography>
            </Box>

            {allOus.map((ou) => (
              <Box
                key={ou}
                onClick={() => toggleOu(ou)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  px: "1rem",
                  py: "0.5rem",
                  cursor: "pointer",
                  "&:hover": { backgroundColor: theme.palette.grey[100] },
                  borderBottom: `0.0625rem solid ${theme.palette.grey[100]}`
                }}
              >
                <Checkbox
                  size="small"
                  checked={checkedOus.has(ou)}
                  onChange={() => toggleOu(ou)}
                  onClick={(e) => e.stopPropagation()}
                  sx={{ p: 0, color: theme.palette.primary.main }}
                />
                <Typography
                  variant="body2"
                  sx={{ flex: 1, color: checkedOus.has(ou) ? theme.palette.text.textDarkGrey : theme.palette.grey[500] }}
                >
                  {ouDisplayName(ou)}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    backgroundColor: theme.palette.grey[100],
                    px: "0.5rem",
                    py: "0.15rem",
                    borderRadius: "999px",
                    fontWeight: 600,
                    flexShrink: 0
                  }}
                >
                  {ouCounts[ou] ?? 0}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <Box
              sx={{
                px: "1.25rem",
                py: "0.875rem",
                borderBottom: `0.0625rem solid ${theme.palette.grey[200]}`,
                flexShrink: 0
              }}
            >
              <SearchBox
                value={search}
                setSearchTerm={setSearch}
                placeHolder={translateText([
                  "googleWorkspaceImport",
                  "searchPlaceholder"
                ])}
                name="googleImportMemberSearch"
              />
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto", p: "1rem" }}>
              <Box
                sx={{
                  backgroundColor: theme.palette.grey[100],
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "0.5rem",
                  gap: "0.125rem"
                }}
              >
                <Table
                  tableName="google-workspace-import-review"
                  isLoading={isLoading}
                  headers={[
                    { id: "name", label: translateText(["googleWorkspaceImport", "columnName"]) },
                    { id: "email", label: translateText(["googleWorkspaceImport", "columnEmail"]) },
                    { id: "unit", label: translateText(["googleWorkspaceImport", "columnUnit"]) },
                    { id: "status", label: translateText(["googleWorkspaceImport", "columnStatus"]) }
                  ]}
                  rows={visibleRecords.map((record) => ({
                    id: record.id,
                    ariaLabel: {
                      row: `${record.firstName} ${record.lastName}`,
                      checkbox: `${record.firstName} ${record.lastName}`
                    },
                    name: (
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
                    ),
                    email: (
                      <Typography variant="body2" color="text.secondary">
                        {record.email}
                      </Typography>
                    ),
                    unit: (
                      <Box
                        sx={{
                          display: "inline-block",
                          px: "0.5rem",
                          py: "0.2rem",
                          borderRadius: "999px",
                          backgroundColor: alpha(theme.palette.info.main, 0.12),
                          color: theme.palette.info.dark,
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          width: "fit-content"
                        }}
                      >
                        {ouDisplayName(record.orgUnitPath)}
                      </Box>
                    ),
                    status: (
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.375rem",
                          px: "0.5rem",
                          py: "0.2rem",
                          borderRadius: "999px",
                          width: "fit-content",
                          backgroundColor:
                            record.googleStatus === "ACTIVE"
                              ? theme.palette.greens.lightBackground
                              : theme.palette.amber.mid,
                          color:
                            record.googleStatus === "ACTIVE"
                              ? theme.palette.greens.midDark
                              : theme.palette.amber.dark,
                          fontSize: "0.7rem",
                          fontWeight: 700
                        }}
                      >
                        <Box
                          sx={{
                            width: "0.375rem",
                            height: "0.375rem",
                            borderRadius: "50%",
                            flexShrink: 0,
                            backgroundColor:
                              record.googleStatus === "ACTIVE"
                                ? theme.palette.greens.midDark
                                : theme.palette.amber.main
                          }}
                        />
                        {record.googleStatus === "ACTIVE"
                          ? translateText(["googleWorkspaceSync", "statusActive"])
                          : translateText(["googleWorkspaceSync", "statusSuspended"])}
                      </Box>
                    )
                  }))}
                  selectedRows={Array.from(selected)}
                  checkboxSelection={{
                    isEnabled: true,
                    isSelectAllEnabled: true,
                    isSelectAllVisible: true,
                    isSelectAllChecked: allVisibleSelected && visibleRecords.length > 0,
                    handleIndividualSelectClick: (id) => () => toggleOne(id),
                    handleSelectAllClick: toggleSelectAll
                  }}
                  customStyles={{
                    wrapper: { overflow: "hidden" },
                    container: { borderRadius: "0.625rem", overflow: "auto" }
                  }}
                  tableHead={{
                    customStyles: {
                      row: {
                        borderTopLeftRadius: "0.625rem",
                        borderTopRightRadius: "0.625rem"
                      },
                      cell: { border: "none" }
                    }
                  }}
                  tableBody={{
                    onRowClick: (row: { id: number }) => toggleOne(row.id),
                    emptyState: {
                      noData: isStagingError
                        ? {
                            title: translateText([
                              "googleWorkspaceImport",
                              "loadErrorTitle"
                            ]),
                            description: translateText([
                              "googleWorkspaceImport",
                              "loadErrorDescription"
                            ])
                          }
                        : {
                            title:
                              allRecords.length === 0
                                ? translateText(["googleWorkspaceImport", "noNewMembersTitle"])
                                : translateText(["googleWorkspaceImport", "noResultsTitle"]),
                            description:
                              allRecords.length === 0
                                ? translateText(["googleWorkspaceImport", "noNewMembersDescription"])
                                : translateText(["googleWorkspaceImport", "noResultsDescription"])
                          }
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: "1.5rem",
            py: "1rem",
            borderTop: `0.0625rem solid ${theme.palette.grey[200]}`,
            backgroundColor: theme.palette.common.white,
            flexShrink: 0
          }}
        >
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            <Box component="span" sx={{ fontWeight: 700, color: theme.palette.text.textDarkGrey }}>
              {selectedCount}
            </Box>{" "}
            {translateText(["googleWorkspaceImport", "ofLabel"])}{" "}
            <Box component="span" sx={{ fontWeight: 700, color: theme.palette.text.textDarkGrey }}>
              {totalCount}
            </Box>{" "}
            {translateText(["googleWorkspaceImport", "selectedLabel"])}
          </Typography>

          <Stack direction="row" gap="0.75rem">
            <ButtonV2
              variant="tertiary"
              size="md"
              onClick={() => setShowExitDialog(true)}
            >
              {translateText(["cancelButton"])}
            </ButtonV2>
            <ButtonV2
              variant="primary"
              size="md"
              disabled={selectedCount === 0}
              onClick={() => setShowConfirmDialog(true)}
            >
              {translateText(["googleWorkspaceImport", "importSelected"], {
                count: selectedCount
              })}
            </ButtonV2>
          </Stack>
        </Box>
      </Box>

      <Modal
        isModalOpen={showExitDialog}
        onCloseModal={() => setShowExitDialog(false)}
        title={translateText(["googleWorkspaceImport", "exitConfirmTitle"])}
      >
        <Stack gap="1.5rem">
          <Typography variant="body2" color="text.secondary">
            {translateText(["googleWorkspaceImport", "exitConfirmDescription"])}
          </Typography>
          <Stack direction="row" gap="0.75rem" justifyContent="flex-end">
            <ButtonV2
              variant="tertiary"
              size="md"
              onClick={() => setShowExitDialog(false)}
            >
              {translateText(["googleWorkspaceImport", "stayButton"])}
            </ButtonV2>
            <ButtonV2
              variant="error"
              size="md"
              onClick={() => router.push(ROUTES.PEOPLE.DIRECTORY)}
            >
              {translateText(["googleWorkspaceImport", "exitButton"])}
            </ButtonV2>
          </Stack>
        </Stack>
      </Modal>

      <Modal
        isModalOpen={showConfirmDialog}
        onCloseModal={() => !isImporting && setShowConfirmDialog(false)}
        isClosable={!isImporting}
        title={translateText(["googleWorkspaceImport", "readyToImportTitle"])}
      >
        <Stack gap="1.25rem">
          <Box
            sx={{
              border: `0.0625rem solid ${theme.palette.grey[200]}`,
              borderRadius: "0.75rem",
              p: "1.5rem",
              textAlign: "center"
            }}
          >
            <Typography sx={{ fontSize: "3rem", fontWeight: 800, lineHeight: 1, color: theme.palette.text.textDarkGrey }}>
              {selectedCount}
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.info.dark, fontWeight: 500, mt: "0.5rem" }}>
              {translateText(["googleWorkspaceImport", "willBeAddedLabel"])}
            </Typography>

            {Object.keys(selectedByOu).length > 0 && (
              <>
                <Divider sx={{ my: "1rem" }} />
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem 1.5rem", textAlign: "left" }}>
                  {Object.entries(selectedByOu).map(([ou, count], i) => (
                    <Stack key={ou} direction="row" alignItems="center" gap="0.5rem">
                      <Box
                        sx={{
                          width: "0.625rem",
                          height: "0.625rem",
                          borderRadius: "50%",
                          backgroundColor: OU_DOT_COLORS[i % OU_DOT_COLORS.length],
                          flexShrink: 0
                        }}
                      />
                      <Typography variant="body2" sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {ou}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, flexShrink: 0 }}>
                        {count}
                      </Typography>
                    </Stack>
                  ))}
                </Box>
              </>
            )}
          </Box>

          <Box sx={{ border: `0.0625rem solid ${theme.palette.grey[200]}`, borderRadius: "0.75rem", p: "1.25rem" }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: theme.palette.text.secondary, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", mb: "0.75rem" }}
            >
              {translateText(["googleWorkspaceImport", "autoSyncHeading"])}
            </Typography>

            <Stack gap="0.875rem">
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap="1rem">
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {translateText(["googleWorkspaceImport", "autoSyncNewLabel"])}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {translateText(["googleWorkspaceImport", "autoSyncNewDescription"])}
                  </Typography>
                </Box>
                <ToggleSwitch on={autoSyncNew} onChange={setAutoSyncNew} />
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap="1rem">
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {translateText(["googleWorkspaceImport", "notifyRemovalsLabel"])}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {translateText(["googleWorkspaceImport", "notifyRemovalsDescription"])}
                  </Typography>
                </Box>
                <ToggleSwitch on={notifyRemovals} onChange={setNotifyRemovals} />
              </Stack>
            </Stack>

            <Typography variant="caption" sx={{ color: theme.palette.grey[500], display: "block", mt: "0.75rem" }}>
              {translateText(["googleWorkspaceImport", "autoSyncFootnote"])}
            </Typography>
          </Box>

          <Stack direction="row" gap="0.75rem" justifyContent="flex-end">
            <ButtonV2
              variant="tertiary"
              size="md"
              disabled={isImporting}
              onClick={() => setShowConfirmDialog(false)}
            >
              {translateText(["backButton"])}
            </ButtonV2>
            <ButtonV2
              variant="primary"
              size="md"
              isLoading={isImporting}
              onClick={handleConfirmImport}
            >
              {translateText(["googleWorkspaceImport", "confirmImportButton"])}
            </ButtonV2>
          </Stack>
        </Stack>
      </Modal>

      <Modal
        isModalOpen={showSuccessDialog}
        onCloseModal={() => router.push(ROUTES.PEOPLE.DIRECTORY)}
        isClosable={false}
        title=""
      >
        <Stack alignItems="center" gap="1rem" sx={{ textAlign: "center", py: "0.5rem" }}>
          <Icon
            name={IconName.CHECK_CIRCLE_ICON}
            width="64"
            height="64"
            fill={theme.palette.greens.midDark}
          />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {translateText(["googleWorkspaceImport", "importSuccessTitle"])}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: "25rem" }}>
            {translateText(["googleWorkspaceImport", "importSuccessDescription"], {
              count: importedCount
            })}
          </Typography>
          <ButtonV2
            variant="primary"
            size="lg"
            onClick={() => router.push(ROUTES.PEOPLE.DIRECTORY)}
          >
            {translateText(["googleWorkspaceImport", "viewDirectoryButton"])}
          </ButtonV2>
        </Stack>
      </Modal>
    </>
  );
};

export default ReviewPage;
