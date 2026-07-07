import { Box } from "@mui/material";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { AdminTypes } from "~community/common/types/AuthTypes";
import { IconName } from "~community/common/types/IconTypes";
import { useGetGoogleConnectionStatus } from "~community/people/api/GoogleWorkspaceSyncApi";
import GoogleWorkspaceSyncBanner from "~community/people/components/molecules/GoogleWorkspaceSyncBanner/GoogleWorkspaceSyncBanner";
import DirectoryPopupController from "~community/people/components/organisms/DirectoryPopupController/DirectoryPopupController";
import EmployeeData from "~community/people/components/organisms/EmployeeData/EmployeeData";
import { usePeopleStore } from "~community/people/store/store";
import { DirectoryModalTypes } from "~community/people/types/ModalTypes";

const Directory: NextPage = () => {
  const router = useRouter();
  const translateText = useTranslator("peopleModule");
  const translatePeople = useTranslator("peopleModule", "peoples");
  const { setToastMessage } = useToast();
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

  // Forwarded from the Settings OAuth-callback shim when the Google
  // Workspace connection attempt failed — surface it here, where the admin
  // actually lands, then strip the query param so it doesn't re-fire on
  // refresh. Guarded by a ref (not just the query param) because this
  // component also calls useToast(), so it re-renders — and this effect can
  // re-run — every time the toast's own close button fires setToastMessage;
  // without the ref, that re-run could re-open the toast right after the
  // admin closes it.
  const hasShownConnectError = useRef(false);
  useEffect(() => {
    if (!router.isReady || router.query.google !== "error") return;
    if (hasShownConnectError.current) return;
    hasShownConnectError.current = true;
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translatePeople(["googleWorkspaceImport", "connectErrorTitle"]),
      description: translatePeople([
        "googleWorkspaceImport",
        "connectCallbackErrorDescription"
      ]),
      autoHideDuration: null,
      onClose: () => setToastMessage((prev) => ({ ...prev, open: false }))
    });
    router.replace(ROUTES.PEOPLE.DIRECTORY, undefined, { shallow: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.google]);

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
