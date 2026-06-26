import {
  Box,
  Button,
  Card,
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
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import authFetch from "~community/common/utils/axiosInterceptor";
import {
  GoogleWorkspaceSyncResult,
  GoogleWorkspaceSyncUser
} from "~community/settings/types/GoogleWorkspaceSyncTypes";

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
}: SyncTableProps): JSX.Element => {
  return (
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
  const translateText = useTranslator("settings");
  const { setToastMessage } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<FullSyncResult | null>(null);
  const [beforeSnapshot, setBeforeSnapshot] = useState<{
    employees: Map<string, any>;
  } | null>(null);

  // Take a snapshot on page load so Refresh Results works for webhook syncs too
  useEffect(() => {
    const takeInitialSnapshot = async () => {
      try {
        const { activeList, inactiveList } = await fetchAllEmployees();
        const allBefore = [...activeList, ...inactiveList];
        setBeforeSnapshot({
          employees: new Map(allBefore.map((e: any) => [e.email, e]))
        });
      } catch {
        // Silently ignore — snapshot taken on Sync Now if this fails
      }
    };
    takeInitialSnapshot();
  }, []);

  const fetchAllEmployees = async () => {
    const [activeRes, inactiveRes] = await Promise.all([
      authFetch.get("/people/employees", {
        params: { accountStatus: ["ACTIVE"], page: 0, size: 100 }
      }),
      authFetch.get("/people/employees", {
        params: { accountStatus: ["TERMINATED", "DEACTIVATED"], page: 0, size: 100 }
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
  ): GoogleWorkspaceSyncUser[] => {
    return afterList
      .filter((emp: any) => {
        const before = snapshot.get(emp.email);

        // Brand new user
        if (!before) return true;

        // Check if any field changed
        return (
          before.firstName !== emp.firstName ||
          before.lastName !== emp.lastName ||
          before.middleName !== emp.middleName ||
          before.accountStatus !== emp.accountStatus ||
          before.employmentAllocation !== emp.employmentAllocation ||
          before.jobTitle !== emp.jobTitle ||
          before.designation !== emp.designation ||
          before.phone !== emp.phone ||
          before.country !== emp.country ||
          before.timeZone !== emp.timeZone
        );
      })
      .map((emp: any) => {
        const before = snapshot.get(emp.email);
        return mapToSyncUser(emp, !before ? "NEW" : "UPDATED");
      });
  };

  const handleSync = async () => {
    setIsLoading(true);
    setIsSyncing(true);
    try {
      // 1. Snapshot BEFORE sync
      const { activeList: beforeActiveList, inactiveList: beforeInactiveList } =
        await fetchAllEmployees();

      const allBefore = [...beforeActiveList, ...beforeInactiveList];
      setBeforeSnapshot({
        employees: new Map(allBefore.map((e: any) => [e.email, e]))
      });

      // 2. Trigger sync — returns immediately (async backend)
      await authFetch.post("/people/sync/external-bulk-person-sync");

      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: "Sync Started",
        description:
          "Sync is running in the background. Click 'Refresh Results' in a few seconds to see the changes."
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to start Google Workspace sync. Please try again.";

      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: "Sync Failed",
        description: errorMessage
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

      // Find new or updated users by comparing with pre-sync snapshot
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

      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: "Results Refreshed",
        description: `${activeList.length} active, ${inactiveList.length} suspended. ${newlyAddedOrUpdatedAccounts.length} new or updated.`
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load results. Please try again.";

      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: "Error Loading Results",
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ mb: "6.25rem" }}>
      <Box sx={{ pb: "1.5rem" }}>
        <Typography variant="h2">Google Workspace Integration</Typography>
      </Box>

      <Card sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h3" sx={{ mb: 1 }}>
            Directory Sync
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Sync users from your Google Workspace directory to Skapp. This will
            automatically create new user accounts and update the status of
            existing users.
          </Typography>
        </Box>

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
            sx={{ minWidth: 120 }}
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
                New / Updated (Last Sync)
              </Typography>
              <Typography variant="h4" sx={{ color: "#1565c0" }}>
                {syncResult.totalNewlyAddedOrUpdated}
              </Typography>
            </Box>
          </Box>
        )}
      </Card>

      {syncResult && (
        <Box>
          {syncResult.newlyAddedOrUpdatedAccounts.length > 0 && (
            <SyncTable
              title="New / Updated Accounts (Last Sync)"
              description={`${syncResult.totalNewlyAddedOrUpdated} users were added or updated in the last sync`}
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
    </Box>
  );
};

export default GoogleWorkspaceSyncSettings;