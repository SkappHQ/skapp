import { Box } from "@mui/material";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { AdminTypes } from "~community/common/types/AuthTypes";
import { IconName } from "~community/common/types/IconTypes";
import DirectoryPopupController from "~community/people/components/organisms/DirectoryPopupController/DirectoryPopupController";
import EmployeeData from "~community/people/components/organisms/EmployeeData/EmployeeData";
import { usePeopleStore } from "~community/people/store/store";
import { DirectoryModalTypes } from "~community/people/types/ModalTypes";

const Pending = () => {
  const translateText = useTranslator("peopleModule", "peoples");
  const { data } = useSession();
  const router = useRouter();

  const isAdmin = data?.user.roles?.includes(AdminTypes.PEOPLE_ADMIN);

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

  const handleBackButtonClick = (): void => {
    setIsPendingInvitationListOpen(false);
    resetEmployeeDataParams();
    router.push(ROUTES.PEOPLE.DIRECTORY);
  };

  useEffect(() => {
    setIsPendingInvitationListOpen(true);
  }, []);
  return (
    <>
      <Head>
        <title>{translateText(["title"])}</title>
      </Head>
      <ContentLayout
        title={translateText(["pendingInvitations.title"])}
        pageHead={translateText(["pendingInvitations.pageHead"])}
        primaryButtonText={
          isAdmin && !isPendingInvitationListOpen
            ? translateText(["addPeople"])
            : undefined
        }
        secondaryBtnText={
          isAdmin && !isPendingInvitationListOpen
            ? translateText(["addBulkPeople"])
            : undefined
        }
        secondaryBtnIconName={IconName.UP_ARROW_ICON}
        onPrimaryButtonClick={() => {
          setIsDirectoryModalOpen(true);
          setDirectoryModalType(DirectoryModalTypes.ADD_NEW_RESOURCE);
        }}
        onSecondaryButtonClick={() => {
          setIsDirectoryModalOpen(true);
          setDirectoryModalType(DirectoryModalTypes.DOWNLOAD_CSV);
        }}
        onBackClick={handleBackButtonClick}
        isDividerVisible
        isBackButtonVisible={true}
      >
        <Box>
          <EmployeeData isRemovePeople={false} />
          <DirectoryPopupController />
        </Box>
      </ContentLayout>
    </>
  );
};

export default Pending;
