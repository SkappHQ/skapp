import { Box } from "@mui/material";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { AdminTypes } from "~community/common/types/AuthTypes";
import { IconName } from "~community/common/types/IconTypes";
import DirectoryPopupController from "~community/people/components/organisms/DirectoryPopupController/DirectoryPopupController";
import EmployeeData from "~community/people/components/organisms/EmployeeData/EmployeeData";
import { usePeopleStore } from "~community/people/store/store";
import { DirectoryModalTypes } from "~community/people/types/ModalTypes";

const Directory: NextPage = () => {
  const translateText = useTranslator("peopleModule", "peoples");
  const { data } = useSession();

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

  useEffect(() => {
    setIsPendingInvitationListOpen(false);
    resetEmployeeDataParams();
  }, []);

  return (
    <>
      <ContentLayout
        pageHead={translateText(["pageHead"])}
        title={translateText(["title"])}
        primaryButtonText={isAdmin ? translateText(["addPeople"]) : undefined}
        secondaryBtnText={
          isAdmin ? translateText(["addBulkPeople"]) : undefined
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
        isDividerVisible
      >
        <Box>
          <EmployeeData isRemovePeople={false} />
          <DirectoryPopupController />
        </Box>
      </ContentLayout>
    </>
  );
};

export default Directory;
