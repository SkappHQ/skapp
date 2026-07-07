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
          isAdmin ? translateText(["peoples.importPeople"]) : undefined
        }
        secondaryBtnClassName="import-people-btn"
        onPrimaryButtonClick={() => {
          setIsDirectoryModalOpen(true);
          setDirectoryModalType(DirectoryModalTypes.ADD_NEW_RESOURCE);
        }}
        onSecondaryButtonClick={() => {
          setIsDirectoryModalOpen(true);
          setDirectoryModalType(DirectoryModalTypes.UPLOAD_TYPE_SELECT);
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
