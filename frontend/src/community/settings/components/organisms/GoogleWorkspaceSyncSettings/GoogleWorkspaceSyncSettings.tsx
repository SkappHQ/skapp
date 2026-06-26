import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { useState, useEffect, JSX } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useToast } from "~community/common/providers/ToastProvider";
import authFetch from "~community/common/utils/axiosInterceptor";
import {
  GoogleWorkspaceSyncUser,
  StagingRecord
} from "~community/settings/types/GoogleWorkspaceSyncTypes";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

interface SyncTableProps {
  title: string;
  description: string;
  users: GoogleWorkspaceSyncUser[];
  isLoading?: boolean;
  highlightColor?: string;
}

const SyncTable = ({
  title,
  description,
  users,
  isLoading = false,
  highlightColor
}: SyncTableProps): JSX.Element => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ mb: 2 }}>
      <Typography variant="h3" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {description}
      </Typography>
    </Box>
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: highlightColor ?? "#f5f5f5" }}>
            <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Display Name</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Change</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                <CircularProgress size={24} />
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  No records found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user, index) => (
              <TableRow key={index} hover>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.displayName ||
                    `${user.firstName || ""} ${user.lastName || ""}`.trim()}
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        user.status === "TERMINATED" ||
                        user.status === "DEACTIVATED"
                          ? "#d32f2f"
                          : "#388e3c",
                      fontWeight: 500
                    }}
                  >
                    {user.status
                      ? user.status.charAt(0).toUpperCase() +
                        user.status.slice(1).toLowerCase()
                      : "Active"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        user.changeType === "NEW" ? "#1565c0" : "#e65100",
                      fontWeight: 500
                    }}
                  >
                    {user.changeType === "NEW" ? "New" : "Updated"}
                  </Typography>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

const changeTypeColor = (type: string) => {
  if (type === "NEW") return "success";
  if (type === "UPDATED") return "warning";
  if (type === "REMOVED") return "error";
  return "default";
};

interface FullSyncResult {
  allActiveAccounts: GoogleWorkspaceSyncUser[];
  allSuspendedAccounts: GoogleWorkspaceSyncUser[];
  newlyAddedOrUpdatedAccounts: GoogleWorkspaceSyncUser[];
  totalActive: number;
  totalSuspended: number;
  totalNewlyAddedOrUpdated: number;
  syncedAt: string;
}

const GoogleWorkspaceSyncSettings = (): JSX.Element => {
  const { setToastMessage } = useToast();

  // Connection state
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedByEmail, setConnectedByEmail] = useState<string | null>(null);
  const [connectedAt, setConnectedAt] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Sync state
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<FullSyncResult | null>(null);
  const [beforeSnapshot, setBeforeSnapshot] = useState<{
    employees: Map<string, any>;
  } | null>(null);

  // Staging review state
  const [stagingRecords, setStagingRecords] = useState<StagingRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);

  const checkStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const resp = await authFetch.get(
        `${API_BASE}/api/v1/integrations/google/status`
      );
      const data = resp.data;
      setIsConnected(!!data.connected);
      setConnectedByEmail(data.connectedByEmail ?? null);
      setConnectedAt(data.connectedAt ?? null);
    } catch {
      setIsConnected(false);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const fetchStagingRecords = async () => {
    try {
      const resp = await authFetch.get("/people/sync/staging");
      const data = resp.data?.results ?? resp.data;
      setStagingRecords(Array.isArray(data) ? data : []);
    } catch {
      setStagingRecords([]);
    }
  };

  useEffect(() => {
    checkStatus();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("google") === "connected") {
        setToastMessage({
          open: true,
          toastType: ToastType.SUCCESS,
          title: "Google Workspace Connected",
          description:
            "Your Google Workspace account has been successfully connected."
        });
        const url = new URL(window.location.href);
        url.searchParams.delete("google");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, []);

  useEffect(() => {
    if (!isConnected) return;
    const init = async () => {
      try {
        const { activeList, inactiveList } = await fetchAllEmployees();
        const allBefore = [...activeList, ...inactiveList];
        setBeforeSnapshot({
          employees: new Map(allBefore.map((e: any) => [e.email, e]))
        });
      } catch {
        // silently ignore
      }
      await fetchStagingRecords();
    };
    init();
  }, [isConnected]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const resp = await authFetch.get(
        `${API_BASE}/api/v1/integrations/google/initiate`
      );
      window.location.href = resp.data.url;
    } catch (error: any) {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: "Connection Failed",
        description:
          error?.response?.data?.message ||
          "Failed to initiate Google Workspace connection."
      });
      setIsConnecting(false);
    }
  };

  const fetchAllEmployees = async () => {
    const [activeRes, inactiveRes] = await Promise.all([
      authFetch.get("/people/employees", {
        params: { accountStatus: ["ACTIVE"], page: 0, size: 100 }
      }),
      authFetch.get("/people/employees", {
        params: {
          accountStatus: ["TERMINATED", "DEACTIVATED"],
          page: 0,
          size: 100
        }
      })
    ]);
    const activeList: any[] = activeRes.data?.results?.[0]?.items ?? [];
    const inactiveList: any[] = inactiveRes.data?.results?.[0]?.items ?? [];
    return { activeList, inactiveList };
  };

  const mapToSyncUser = (
    emp: any,
    changeType?: "NEW" | "UPDATED"
  ): GoogleWorkspaceSyncUser => ({
    email: emp?.email || "",
    firstName: emp?.firstName || "",
    lastName: emp?.lastName || "",
    displayName:
      `${emp?.firstName || ""} ${emp?.lastName || ""}`.trim() || emp?.email,
    status: emp?.accountStatus,
    changeType
  });

  const detectChanges = (
    afterList: any[],
    snapshot: Map<string, any>
  ): GoogleWorkspaceSyncUser[] =>
    afterList
      .filter((emp: any) => {
        const before = snapshot.get(emp.email);
        if (!before) return true;
        return (
          before.firstName !== emp.firstName ||
          before.lastName !== emp.lastName ||
          before.accountStatus !== emp.accountStatus
        );
      })
      .map((emp: any) => {
        const before = snapshot.get(emp.email);
        return mapToSyncUser(emp, !before ? "NEW" : "UPDATED");
      });

  const handleSync = async () => {
    setIsLoading(true);
    setIsSyncing(true);
    try {
      const { activeList: beforeActiveList, inactiveList: beforeInactiveList } =
        await fetchAllEmployees();
      const allBefore = [...beforeActiveList, ...beforeInactiveList];
      setBeforeSnapshot({
        employees: new Map(allBefore.map((e: any) => [e.email, e]))
      });

      await authFetch.post("/people/sync/external-bulk-person-sync");

      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: "Sync Started",
        description:
          "Sync is running in the background. Click 'Refresh Results' in a few seconds to see pending changes."
      });

      setTimeout(async () => {
        await fetchStagingRecords();
      }, 5000);
    } catch (error: any) {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: "Sync Failed",
        description:
          error?.response?.data?.message ||
          "Failed to start Google Workspace sync."
      });
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  const handleRefreshResults = async () => {
    setIsLoading(true);
    try {
      const { activeList, inactiveList } = await fetchAllEmployees();
      const allAfter = [...activeList, ...inactiveList];
      const newlyAddedOrUpdatedAccounts: GoogleWorkspaceSyncUser[] =
        beforeSnapshot
          ? detectChanges(allAfter, beforeSnapshot.employees)
          : [];

      setSyncResult({
        allActiveAccounts: activeList.map((emp) => mapToSyncUser(emp)),
        allSuspendedAccounts: inactiveList.map((emp) => mapToSyncUser(emp)),
        newlyAddedOrUpdatedAccounts,
        totalActive: activeList.length,
        totalSuspended: inactiveList.length,
        totalNewlyAddedOrUpdated: newlyAddedOrUpdatedAccounts.length,
        syncedAt: new Date().toISOString()
      });

      await fetchStagingRecords();

      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: "Results Refreshed",
        description: `${activeList.length} active, ${inactiveList.length} suspended.`
      });
    } catch (error: any) {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: "Error Loading Results",
        description:
          error?.response?.data?.message || "Failed to load results."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (ids: number[]) => {
    setIsReviewing(true);
    try {
      await authFetch.post("/people/sync/staging/approve", { ids });
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: "Approved",
        description: `${ids.length} change(s) approved and applied to Skapp.`
      });
      setSelectedIds([]);
      await fetchStagingRecords();
    } catch (error: any) {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: "Approve Failed",
        description:
          error?.response?.data?.message || "Failed to approve changes."
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const handleReject = async (ids: number[]) => {
    setIsReviewing(true);
    try {
      await authFetch.post("/people/sync/staging/reject", { ids });
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: "Rejected",
        description: `${ids.length} change(s) rejected.`
      });
      setSelectedIds([]);
      await fetchStagingRecords();
    } catch (error: any) {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: "Reject Failed",
        description:
          error?.response?.data?.message || "Failed to reject changes."
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const allSelected =
    stagingRecords.length > 0 &&
    selectedIds.length === stagingRecords.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(stagingRecords.map((r) => r.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <Box sx={{ mb: "6.25rem" }}>
      <Box sx={{ pb: "1.5rem" }}>
        <Typography variant="h2">Google Workspace Integration</Typography>
      </Box>

      {isCheckingStatus ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : !isConnected ? (
        <Card sx={{ p: 3, mb: 4 }}>
          <Typography variant="h3" sx={{ mb: 1 }}>
            Connect Google Workspace
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Connect your Google Workspace admin account to enable automatic
            directory sync. Users from your Google Workspace will be staged for
            your review before being imported into Skapp.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConnect}
            disabled={isConnecting}
            sx={{ minWidth: 220 }}
          >
            {isConnecting && <CircularProgress size={20} sx={{ mr: 1 }} />}
            {isConnecting ? "Connecting..." : "Connect Google Workspace"}
          </Button>
        </Card>
      ) : (
        <>
          {/* ── Sync Controls ───────────────────────────────────────────── */}
          <Card sx={{ p: 3, mb: 4 }}>
            {connectedByEmail && (
              <Box
                sx={{
                  mb: 2,
                  px: 1.5,
                  py: 1,
                  backgroundColor: "#e8f5e9",
                  borderRadius: 1,
                  display: "inline-flex",
                  alignItems: "center"
                }}
              >
                <Typography variant="body2" sx={{ color: "#2e7d32" }}>
                  Connected as <strong>{connectedByEmail}</strong>
                  {connectedAt &&
                    ` · ${new Date(connectedAt).toLocaleDateString()}`}
                </Typography>
              </Box>
            )}

            <Typography variant="h3" sx={{ mb: 1 }}>
              Directory Sync
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Sync users from your Google Workspace. Changes are staged for
              review before being applied to Skapp.
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                flexWrap: "wrap",
                mb: 2
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleSync}
                disabled={isLoading}
                sx={{ minWidth: 120 }}
              >
                {isSyncing && <CircularProgress size={20} sx={{ mr: 1 }} />}
                {isSyncing ? "Syncing..." : "Sync Now"}
              </Button>

              <Button
                variant="outlined"
                color="primary"
                onClick={handleRefreshResults}
                disabled={isLoading}
                sx={{ minWidth: 140 }}
              >
                {isLoading && !isSyncing && (
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                )}
                {isLoading && !isSyncing ? "Loading..." : "Refresh Results"}
              </Button>
            </Box>

            {syncResult && (
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Total Active
                  </Typography>
                  <Typography variant="h4" sx={{ color: "#388e3c" }}>
                    {syncResult.totalActive}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Total Suspended
                  </Typography>
                  <Typography variant="h4" sx={{ color: "#d32f2f" }}>
                    {syncResult.totalSuspended}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    New / Updated
                  </Typography>
                  <Typography variant="h4" sx={{ color: "#1565c0" }}>
                    {syncResult.totalNewlyAddedOrUpdated}
                  </Typography>
                </Box>
              </Box>
            )}
          </Card>

          {/* ── Pending Review ──────────────────────────────────────────── */}
          {stagingRecords.length > 0 && (
            <Card sx={{ p: 3, mb: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                  flexWrap: "wrap",
                  gap: 1
                }}
              >
                <Box>
                  <Typography variant="h3" sx={{ mb: 0.5 }}>
                    Pending Review
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stagingRecords.length} change(s) from the latest sync are
                    awaiting your approval.
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    disabled={selectedIds.length === 0 || isReviewing}
                    onClick={() => handleApprove(selectedIds)}
                  >
                    Approve Selected ({selectedIds.length})
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    disabled={selectedIds.length === 0 || isReviewing}
                    onClick={() => handleReject(selectedIds)}
                  >
                    Reject Selected ({selectedIds.length})
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    disabled={isReviewing}
                    onClick={() =>
                      handleApprove(stagingRecords.map((r) => r.id))
                    }
                  >
                    Approve All
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    disabled={isReviewing}
                    onClick={() =>
                      handleReject(stagingRecords.map((r) => r.id))
                    }
                  >
                    Reject All
                  </Button>
                </Box>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#fff8e1" }}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={allSelected}
                          indeterminate={
                            selectedIds.length > 0 && !allSelected
                          }
                          onChange={toggleSelectAll}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Change</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        Google Status
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isReviewing ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <CircularProgress size={24} />
                        </TableCell>
                      </TableRow>
                    ) : (
                      stagingRecords.map((record) => (
                        <TableRow
                          key={record.id}
                          hover
                          selected={selectedIds.includes(record.id)}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedIds.includes(record.id)}
                              onChange={() => toggleSelect(record.id)}
                            />
                          </TableCell>
                          <TableCell>{record.email}</TableCell>
                          <TableCell>
                            {`${record.firstName || ""} ${record.lastName || ""}`.trim() ||
                              "—"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={record.changeType}
                              color={changeTypeColor(record.changeType) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                color:
                                  record.googleStatus === "SUSPENDED"
                                    ? "#d32f2f"
                                    : "#388e3c",
                                fontWeight: 500
                              }}
                            >
                              {record.googleStatus}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}

          {/* ── Sync Result Tables ──────────────────────────────────────── */}
          {syncResult && (
            <Box>
              {syncResult.newlyAddedOrUpdatedAccounts.length > 0 && (
                <SyncTable
                  title="New / Updated Accounts (Last Sync)"
                  description={`${syncResult.totalNewlyAddedOrUpdated} users were added or updated`}
                  users={syncResult.newlyAddedOrUpdatedAccounts}
                  isLoading={isLoading}
                  highlightColor="#e3f2fd"
                />
              )}
              <SyncTable
                title="All Active Accounts"
                description={`${syncResult.totalActive} active users in the directory`}
                users={syncResult.allActiveAccounts}
                isLoading={isLoading}
              />
              <SyncTable
                title="All Suspended Accounts"
                description={`${syncResult.totalSuspended} terminated or deactivated users`}
                users={syncResult.allSuspendedAccounts}
                isLoading={isLoading}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default GoogleWorkspaceSyncSettings;
