import { Box } from "@mui/material";
import { NextPage } from "next";
import { useEffect } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { AdminTypes } from "~community/common/types/AuthTypes";
import { IconName } from "~community/common/types/IconTypes";
import { useGetGoogleConnectionStatus } from "~community/people/api/GoogleWorkspaceSyncApi";
import GoogleWorkspaceSyncBanner from "~community/people/components/molecules/GoogleWorkspaceSyncBanner/GoogleWorkspaceSyncBanner";
import DirectoryPopupController from "~community/people/components/organisms/DirectoryPopupController/DirectoryPopupController";
import EmployeeData from "~community/people/components/organisms/EmployeeData/EmployeeData";
import { usePeopleStore } from "~community/people/store/store";
import { DirectoryModalTypes } from "~community/people/types/ModalTypes";

const Directory: NextPage = () => {
  const translateText = useTranslator("peopleModule");
  const { user } = useAuth();

  const isAdmin = user?.roles?.includes(AdminTypes.PEOPLE_ADMIN);

  // Once the org has connected to Google Workspace, the chooser (CSV vs
  // Google Workspace) has done its job — the secondary button reverts to
  // exactly what it was before this feature existed: a plain bulk-CSV
  // upload trigger, since Google Workspace imports are already surfaced
  // via the sync banner + review flow at that point.
  // Reuses the same query (and cache) GoogleWorkspaceSyncBanner already
  // fires below, rather than firing a second, separate status fetch.
  const { data: googleConnectionStatus } =
    useGetGoogleConnectionStatus(!!isAdmin);
  const isGoogleConnected = !!googleConnectionStatus?.connected;

  const {
    setDirectoryModalType,
    setIsDirectoryModalOpen,
    setIsPendingInvitationListOpen,
    resetEmployeeDataParams,
    isPendingInvitationListOpen
  } = usePeopleStore((state) => state);

  useEffect(() => {
    typeof isPendingInvitationListOpen === "undefined" &&
      setIsPendingInvitationListOpen(false);
  }, [isPendingInvitationListOpen, setIsPendingInvitationListOpen]);

  useEffect(() => {
    setIsPendingInvitationListOpen(false);
    resetEmployeeDataParams();
  }, []);

  return (
    <>
      <ContentLayout
        breadcrumbs={[
          {
            label: translateText(["dashboard.people"])
          },
          {
            label: translateText(["peoples.title"])
          }
        ]}
        pageHead={translateText(["peoples.pageHead"])}
        title={translateText(["peoples.title"])}
        primaryButtonText={
          isAdmin ? translateText(["peoples.addPeople"]) : undefined
        }
        secondaryBtnText={
          isAdmin
            ? translateText([
                isGoogleConnected
                  ? "peoples.addBulkPeople"
                  : "peoples.importPeople"
              ])
            : undefined
        }
        secondaryBtnIconName={IconName.DOWNLOAD_ICON}
        secondaryBtnIconFill="var(--color-primary-text)"
        onPrimaryButtonClick={() => {
          setIsDirectoryModalOpen(true);
          setDirectoryModalType(DirectoryModalTypes.ADD_NEW_RESOURCE);
        }}
        onSecondaryButtonClick={() => {
          setIsDirectoryModalOpen(true);
          setDirectoryModalType(
            isGoogleConnected
              ? DirectoryModalTypes.DOWNLOAD_CSV
              : DirectoryModalTypes.UPLOAD_TYPE_SELECT
          );
        }}
        isDividerVisible
      >
        <Box>
          {isAdmin && <GoogleWorkspaceSyncBanner />}
          <EmployeeData isRemovePeople={false} />
          <DirectoryPopupController />
        </Box>
      </ContentLayout>
    </>
  );
};

export default Directory;
