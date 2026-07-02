import { Box } from "@mui/material";
import { NextPage } from "next";
import { useEffect } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { AdminTypes } from "~community/common/types/AuthTypes";
import { IconName } from "~community/common/types/IconTypes";
import GoogleWorkspaceSyncBanner from "~community/people/components/molecules/GoogleWorkspaceSyncBanner/GoogleWorkspaceSyncBanner";
import DirectoryPopupController from "~community/people/components/organisms/DirectoryPopupController/DirectoryPopupController";
import EmployeeData from "~community/people/components/organisms/EmployeeData/EmployeeData";
import { usePeopleStore } from "~community/people/store/store";
import { DirectoryModalTypes } from "~community/people/types/ModalTypes";

const Directory: NextPage = () => {
  const translateText = useTranslator("peopleModule");
  const { user } = useAuth();

  const isAdmin = user?.roles?.includes(AdminTypes.PEOPLE_ADMIN);
  // "Import from Google Workspace" is only ever surfaced to Super Admins;
  // everyone else who can manage people keeps the plain CSV bulk upload
  // entry point they already have today.
  const isSuperAdmin = !!user?.roles?.includes(AdminTypes.SUPER_ADMIN);

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
            ? isSuperAdmin
              ? translateText(["peoples.importPeople"])
              : translateText(["peoples.addBulkPeople"])
            : undefined
        }
        secondaryBtnIconName={IconName.UP_ARROW_ICON}
        onPrimaryButtonClick={() => {
          setIsDirectoryModalOpen(true);
          setDirectoryModalType(DirectoryModalTypes.ADD_NEW_RESOURCE);
        }}
        onSecondaryButtonClick={() => {
          setIsDirectoryModalOpen(true);
          setDirectoryModalType(
            isSuperAdmin
              ? DirectoryModalTypes.UPLOAD_TYPE_SELECT
              : DirectoryModalTypes.DOWNLOAD_CSV
          );
        }}
        isDividerVisible
      >
        <Box>
          {isSuperAdmin && <GoogleWorkspaceSyncBanner />}
          <EmployeeData isRemovePeople={false} />
          <DirectoryPopupController />
        </Box>
      </ContentLayout>
    </>
  );
};

export default Directory;
