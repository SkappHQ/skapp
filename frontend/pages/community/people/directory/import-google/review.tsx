import { Box, IconButton, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ButtonV2, StatusComponent, Toggle, Tooltip } from "@rootcodelabs/skapp-ui";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";

import Checkbox from "~community/common/components/atoms/Checkbox/Checkbox";
import ReadOnlyChip from "~community/common/components/atoms/Chips/BasicChip/ReadOnlyChip";
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

const ouDisplayName = (path?: string): string => {
  if (!path) return "Unknown";
  const parts = path.split("/").filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : "Unknown";
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

  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (showSuccessDialog) {
      successHeadingRef.current?.focus();
    }
  }, [showSuccessDialog]);

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

  // This page takes over the viewport via a fixed overlay, but that alone
  // doesn't stop the underlying page from scrolling — on shorter screens the
  // page behind it can still be tall enough to show its own scrollbar.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

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

  // OU filter checkboxes control which rows are *visible*; row selection is
  // an entirely separate concern that never gets touched by filtering, so a
  // person's checked state survives toggling OUs off and back on, or typing
  // and clearing a search — only explicit row/select-all clicks change it.
  useEffect(() => {
    const ouSet = new Set(allRecords.map((r) => r.orgUnitPath ?? "Unknown"));
    setCheckedOus(ouSet);
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

  const totalCount = allRecords.length;
  const selectedCount = selected.size;

  const allVisibleSelected =
    visibleRecords.length > 0 && visibleRecords.every((r) => selected.has(r.id));
  const someVisibleSelected = visibleRecords.some((r) => selected.has(r.id));

  const toggleOu = (ou: string) => {
    setCheckedOus((prev) => {
      const next = new Set(prev);
      next.has(ou) ? next.delete(ou) : next.add(ou);
      return next;
    });
  };

  const toggleAllOus = () => {
    setCheckedOus(checkedOus.size === allOus.length ? new Set() : new Set(allOus));
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
          ]),
          autoHideDuration: null
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
          component="a"
          href="#main-content"
          sx={{
            position: "absolute",
            left: "1rem",
            top: "-3rem",
            zIndex: 1400,
            padding: "0.5rem 1rem",
            borderRadius: "0.25rem",
            backgroundColor: theme.palette.common.white,
            color: theme.palette.text.primary,
            boxShadow: 2,
            transition: "top 0.15s ease-in-out",
            "&:focus": { top: "1rem" }
          }}
        >
          {translateText(["googleWorkspaceImport", "skipToMainContent"])}
        </Box>
        {showSuccessDialog ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            gap="1rem"
            sx={{ flex: 1, textAlign: "center", px: "1.5rem" }}
          >
            <Typography sx={{ fontSize: "5rem", lineHeight: 1 }} aria-hidden="true">🎉</Typography>
            <Typography
              ref={successHeadingRef}
              tabIndex={-1}
              component="h1"
              sx={{ fontSize: "1.25rem", fontWeight: 700, color: theme.palette.grey[700], outline: "none" }}
            >
              {translateText(["googleWorkspaceImport", "importSuccessTitle"])}
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: "25rem" }}>
              {translateText(["googleWorkspaceImport", "importSuccessDescription"], {
                count: importedCount
              })}
            </Typography>
            <ButtonV2
              variant="tertiary"
              size="md"
              isFullWidth
              style={{ width: "18rem" }}
              onClick={() => router.push(ROUTES.PEOPLE.DIRECTORY)}
            >
              {translateText(["googleWorkspaceImport", "viewDirectoryButton"])}
            </ButtonV2>
          </Stack>
        ) : (
          <>
            <Stack
              direction="row"
              alignItems="center"
              gap="0.875rem"
              sx={{
                px: "1.5rem",
                py: "0.875rem",
                borderBottom: `0.0625rem solid ${theme.palette.grey[200]}`,
                flexShrink: 0
              }}
            >
              <Tooltip
                content={translateText(["googleWorkspaceImport", "exitTooltip"])}
                position="bottom"
              >
                <IconButton
                  onClick={() => setShowExitDialog(true)}
                  aria-label={translateText(["googleWorkspaceImport", "exitTooltip"])}
                  sx={{ padding: 0 }}
                >
                  <Icon name={IconName.CLOSE_STATUS_POPUP_ICON} />
                </IconButton>
              </Tooltip>

              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {translateText(["googleWorkspaceImport", "reviewTitle"])}
              </Typography>
            </Stack>

            <Box
              id="main-content"
              tabIndex={-1}
              sx={{ flex: 1, display: "flex", overflow: "hidden", gap: "3rem", outline: "none" }}
            >
          <Box
            sx={{
              width: "13rem",
              flexShrink: 0,
              borderRight: `0.0625rem solid ${theme.palette.grey[200]}`,
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              py: "1.5rem"
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                px: "1.25rem",
                py: "0.375rem"
              }}
            >
              <Checkbox
                name="select-all-units"
                checked={checkedOus.size === allOus.length && allOus.length > 0}
                onChange={toggleAllOus}
                ariaLabel={translateText(["googleWorkspaceImport", "selectAllUnits"])}
                label={translateText(["googleWorkspaceImport", "selectAllUnits"])}
                size="small"
                customStyles={{ padding: "0.25rem" }}
                labelStyles={{
                  marginLeft: 0,
                  gap: "0.5rem",
                  "& .MuiFormControlLabel-label": { fontSize: "0.8125rem" }
                }}
              />
            </Box>

            {allOus.map((ou) => (
              <Box
                key={ou}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  px: "1.25rem",
                  py: "0.375rem",
                  "&:hover": { backgroundColor: theme.palette.grey[100] }
                }}
              >
                <Checkbox
                  name={`ou-${ou}`}
                  checked={checkedOus.has(ou)}
                  onChange={() => toggleOu(ou)}
                  ariaLabel={ouDisplayName(ou)}
                  label={ouDisplayName(ou)}
                  size="small"
                  customStyles={{ padding: "0.25rem" }}
                  labelStyles={{
                    marginLeft: 0,
                    gap: "0.5rem",
                    "& .MuiFormControlLabel-label": { fontSize: "0.8125rem" }
                  }}
                />
              </Box>
            ))}
          </Box>

          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <Box
              sx={{
                px: "1.5rem",
                pt: "1.5rem",
                pb: "0.875rem",
                flexShrink: 0
              }}
            >
              <Typography variant="body2" sx={{ display: "block", mb: "1rem" }}>
                {translateText(["googleWorkspaceImport", "reviewSubtitlePrefix"])}{" "}
                {totalCount}{" "}
                {translateText(["googleWorkspaceImport", "reviewSubtitleMiddle"])}{" "}
                {allOus.length}{" "}
                {translateText(["googleWorkspaceImport", "reviewSubtitleSuffix"])}
              </Typography>

              <Stack direction="row" alignItems="center" justifyContent="space-between" gap="1rem">
                <Box sx={{ width: "24rem" }}>
                  <SearchBox
                    value={search}
                    setSearchTerm={setSearch}
                    placeHolder={translateText([
                      "googleWorkspaceImport",
                      "searchPlaceholder"
                    ])}
                    name="googleImportMemberSearch"
                    searchBoxStyles={{ borderRadius: "999px", padding: "0.5rem 1.5rem" }}
                  />
                </Box>

                <Typography
                  variant="body2"
                  aria-live="polite"
                  aria-atomic="true"
                  sx={{ color: theme.palette.text.secondary, whiteSpace: "nowrap" }}
                >
                  {selectedCount} {translateText(["googleWorkspaceImport", "ofLabel"])}{" "}
                  {totalCount} {translateText(["googleWorkspaceImport", "selectedLabel"])}
                </Typography>
              </Stack>
            </Box>

            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                px: "1.5rem",
                py: "1rem"
              }}
            >
              <Box
                sx={{
                  backgroundColor: theme.palette.grey[100],
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "0.5rem",
                  gap: "0.125rem",
                  flex: 1,
                  minHeight: 0
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
                      checkbox: `${record.firstName} ${record.lastName} — ${record.email}`
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
                          justifyContent: "flex-start"
                        }}
                      />
                    ),
                    email: <Typography variant="body2">{record.email}</Typography>,
                    unit: (
                      <ReadOnlyChip
                        label={ouDisplayName(record.orgUnitPath)}
                        chipStyles={{
                          border: `0.0625rem solid ${theme.palette.grey[200]}`,
                          py: "0.25rem",
                          px: "0.75rem",
                          fontSize: "0.875rem",
                          width: "fit-content"
                        }}
                      />
                    ),
                    status: (
                      <StatusComponent
                        text={
                          record.googleStatus === "ACTIVE"
                            ? translateText(["googleWorkspaceSync", "statusActive"])
                            : translateText(["googleWorkspaceSync", "statusSuspended"])
                        }
                        iconColor={
                          record.googleStatus === "ACTIVE"
                            ? theme.palette.greens.midDark
                            : theme.palette.amber.main
                        }
                        backgroundColor={
                          record.googleStatus === "ACTIVE"
                            ? "bg-semantic-green-background"
                            : "bg-semantic-amber-background"
                        }
                        textColor={
                          record.googleStatus === "ACTIVE"
                            ? "text-semantic-green-text"
                            : "text-semantic-amber-text"
                        }
                        className="w-32 justify-center"
                      />
                    )
                  }))}
                  selectedRows={Array.from(selected)}
                  checkboxSelection={{
                    isEnabled: true,
                    isSelectAllEnabled: true,
                    isSelectAllVisible: true,
                    isSelectAllChecked: allVisibleSelected && visibleRecords.length > 0,
                    isSelectAllIndeterminate: someVisibleSelected && !allVisibleSelected,
                    selectAllAriaLabel: translateText(
                      ["googleWorkspaceImport", "selectAllUsersAriaLabel"],
                      { count: visibleRecords.length }
                    ),
                    handleIndividualSelectClick: (id) => () => toggleOne(id),
                    handleSelectAllClick: toggleSelectAll
                  }}
                  customStyles={{
                    wrapper: { overflow: "hidden", flex: 1, minHeight: 0 },
                    container: {
                      borderRadius: "0.625rem",
                      overflow: "auto",
                      maxHeight: "none",
                      flex: 1,
                      minHeight: 0
                    }
                  }}
                  tableHead={{
                    customStyles: {
                      row: {
                        borderTopLeftRadius: "0.625rem",
                        borderTopRightRadius: "0.625rem"
                      },
                      cell: {
                        border: "none",
                        padding: "0.5rem 1rem",
                        "& .MuiTypography-root": { fontSize: "0.875rem", fontWeight: 400 }
                      }
                    }
                  }}
                  tableBody={{
                    onRowClick: (row: { id: number }) => toggleOne(row.id),
                    customStyles: {
                      cell: {
                        wrapper: { padding: "0.5rem 1rem" }
                      },
                      row: {
                        active: {
                          "&:focus": { outline: "none" },
                          "&:focus-visible": { outline: "none" }
                        }
                      }
                    },
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
                  tableFoot={{
                    pagination: { isEnabled: false }
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
            justifyContent: "flex-end",
            px: "1.5rem",
            py: "1rem",
            flexShrink: 0
          }}
        >
          <Stack direction="row" gap="0.75rem">
            <ButtonV2
              variant="tertiary"
              size="md"
              icon={<Icon name={IconName.CLOSE_ICON} />}
              iconPosition="end"
              onClick={() => setShowExitDialog(true)}
            >
              {translateText(["cancelButton"])}
            </ButtonV2>
            <ButtonV2
              variant="primary"
              size="md"
              aria-disabled={selectedCount === 0}
              aria-describedby="import-selected-hint"
              style={
                selectedCount === 0
                  ? { opacity: 0.5, cursor: "not-allowed" }
                  : undefined
              }
              onClick={() => {
                if (selectedCount === 0) return;
                setShowConfirmDialog(true);
              }}
            >
              {translateText(["googleWorkspaceImport", "importSelected"], {
                count: selectedCount
              })}
            </ButtonV2>
            <Box
              id="import-selected-hint"
              sx={{
                position: "absolute",
                width: "1px",
                height: "1px",
                overflow: "hidden",
                clip: "rect(0 0 0 0)"
              }}
            >
              {translateText(["googleWorkspaceImport", "noUsersSelectedHint"])}
            </Box>
          </Stack>
        </Box>
          </>
        )}
      </Box>

      <Modal
        isModalOpen={showExitDialog}
        onCloseModal={() => setShowExitDialog(false)}
        disableEscapeKeyDown={false}
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
        disableEscapeKeyDown={false}
        title={translateText(["googleWorkspaceImport", "readyToImportTitle"])}
      >
        <Stack gap="1.25rem">
          <Box
            sx={{
              border: `0.0625rem solid ${theme.palette.secondary.main}`,
              borderRadius: "0.5rem",
              py: "1rem",
              textAlign: "center"
            }}
          >
            <Typography sx={{ fontSize: "1.875rem", fontWeight: 600, lineHeight: 1, color: theme.palette.text.primary }}>
              {selectedCount}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: "0.5rem" }}>
              {translateText(["googleWorkspaceImport", "willBeAddedLabel"])}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: "1rem" }}>
              {translateText(["googleWorkspaceImport", "autoSyncHeading"])}
            </Typography>

            <Stack gap="1.25rem">
              <Stack direction="row" justifyContent="space-between" alignItems="center" gap="1rem">
                <Typography variant="body1">
                  {translateText(["googleWorkspaceImport", "autoSyncNewLabel"])}
                </Typography>
                <Toggle
                  checked={autoSyncNew}
                  onChange={setAutoSyncNew}
                  ariaLabel={translateText(["googleWorkspaceImport", "autoSyncNewLabel"])}
                />
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center" gap="1rem">
                <Typography variant="body1">
                  {translateText(["googleWorkspaceImport", "notifyRemovalsLabel"])}
                </Typography>
                <Toggle
                  checked={notifyRemovals}
                  onChange={setNotifyRemovals}
                  ariaLabel={translateText(["googleWorkspaceImport", "notifyRemovalsLabel"])}
                />
              </Stack>
            </Stack>
          </Box>

          <Stack
            direction="row"
            gap="1rem"
            justifyContent="flex-end"
            sx={{ width: "20rem", alignSelf: "flex-end" }}
          >
            <ButtonV2
              variant="tertiary"
              size="md"
              isFullWidth
              disabled={isImporting}
              onClick={() => setShowConfirmDialog(false)}
              style={{ flex: 1 }}
            >
              {translateText(["backButton"])}
            </ButtonV2>
            <ButtonV2
              variant="primary"
              size="md"
              isFullWidth
              isLoading={isImporting}
              disabled={isImporting}
              aria-busy={isImporting}
              onClick={handleConfirmImport}
              style={{ flex: 1 }}
            >
              {translateText(["googleWorkspaceImport", "confirmImportButton"])}
            </ButtonV2>
          </Stack>
          {isImporting && (
            <Box
              role="status"
              aria-live="assertive"
              sx={{
                position: "absolute",
                width: "1px",
                height: "1px",
                overflow: "hidden",
                clip: "rect(0 0 0 0)"
              }}
            >
              {translateText(["googleWorkspaceImport", "importingLabel"])}
            </Box>
          )}
        </Stack>
      </Modal>
    </>
  );
};

export default ReviewPage;
