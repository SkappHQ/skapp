import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/router";
import { JSX } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import { signOut } from "~community/auth/utils/authUtils";
import ROUTES from "~community/common/constants/routes";
import { appBarTestId } from "~community/common/constants/testIds";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { theme } from "~community/common/theme/theme";
import { AdminTypes, ManagerTypes } from "~community/common/types/AuthTypes";
import { IconName } from "~community/common/types/IconTypes";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";
import { usePeopleStore } from "~community/people/store/store";

import Icon from "../../atoms/Icon/Icon";
import Avatar from "../Avatar/Avatar";

interface Props {
  handleCloseMenu: any;
}

const ProfileMenu = ({ handleCloseMenu }: Props): JSX.Element => {
  const router = useRouter();
  const translateText = useTranslator("appBar");
  const { user } = useAuth();
  const { data: employee } = useGetUserPersonalDetails();
  const isPeopleManagerOrSuperAdmin = user?.roles?.includes(
    ManagerTypes.PEOPLE_MANAGER || AdminTypes.SUPER_ADMIN
  );

  const asPath = router.asPath;

  const {
    setSelectedEmployeeId,
    resetEmployeeData,
    resetEmployeeDataChanges,
    resetPeopleSlice
  } = usePeopleStore((state) => state);

  const handelViewAccount = async () => {
    if (isPeopleManagerOrSuperAdmin) {
      if (asPath !== ROUTES.PEOPLE.EDIT(employee?.employeeId)) {
        resetEmployeeDataChanges();
        resetEmployeeData();
        resetPeopleSlice();
      }
      setSelectedEmployeeId(employee?.employeeId as unknown as string);
      await router.push(ROUTES.PEOPLE.EDIT(employee?.employeeId));
    } else {
      if (asPath !== ROUTES.PEOPLE.ACCOUNT) {
        resetEmployeeDataChanges();
        resetEmployeeData();
        resetPeopleSlice();
      }
      router.push(ROUTES.PEOPLE.ACCOUNT);
    }

    handleCloseMenu();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          <Box>
            <Avatar
              firstName={employee?.firstName || ""}
              lastName={employee?.lastName || ""}
              alt={`${employee?.firstName} ${employee?.lastName}`}
              src={employee?.authPic || ""}
            />
          </Box>
          <Stack>
            <Typography variant="h3">
              {employee?.firstName} {employee?.lastName}
            </Typography>
            <Typography
              variant="body2"
              color={theme.palette.text.secondary}
              sx={{ fontSize: 13, fontWeight: 400 }}
            >
              {employee?.jobTitle?.name}
            </Typography>
          </Stack>
        </Stack>
        <ButtonV2
          variant={"tertiary"}
          onClick={handelViewAccount}
          fullWidth={false}
          data-testid={appBarTestId.appBar.viewAccountBtn}
          icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
          iconPosition="end"
        >
          {translateText(["viewAccount"])}
        </ButtonV2>
      </Stack>
      <ButtonV2
        variant={"tertiary"}
        onClick={handleSignOut}
        fullWidth
        icon={<Icon name={IconName.SIGNOUT_ICON} />}
        iconPosition="start"
        className="mt-3"
      >
        {translateText(["logout"])}
      </ButtonV2>
    </Box>
  );
};

export default ProfileMenu;
