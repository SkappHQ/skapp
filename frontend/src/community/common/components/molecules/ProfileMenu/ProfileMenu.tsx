import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { JSX } from "react";

import ROUTES from "~community/common/constants/routes";
import { appBarTestId } from "~community/common/constants/testIds";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { theme } from "~community/common/theme/theme";
import { AdminTypes, ManagerTypes } from "~community/common/types/AuthTypes";
import { IconName } from "~community/common/types/IconTypes";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";
import { usePeopleStore } from "~community/people/store/store";

import Button from "../../atoms/Button/Button";
import Icon from "../../atoms/Icon/Icon";
import Avatar from "../Avatar/Avatar";

interface Props {
  handleCloseMenu: any;
}

const ProfileMenu = ({ handleCloseMenu }: Props): JSX.Element => {
  const router = useRouter();
  const translateText = useTranslator("appBar");
  const { data: session } = useSession();
  const { data: employee } = useGetUserPersonalDetails();
  const isPeopleManagerOrSuperAdmin = session?.user.roles?.includes(
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

  const getSubDomain = (url: string, multipleValues: boolean = false) => {
    const subdomain = multipleValues ? url.split(".") : url.split(".")[0];
    return subdomain;
  };

  const tenantId =
    typeof window !== "undefined" ? getSubDomain(window.location.hostname) : "";

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: `/signin?tenantId=${tenantId}`,
      redirect: true
    });
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
        <Button
          buttonStyle={ButtonStyle.TERTIARY}
          endIcon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
          label={translateText(["viewAccount"])}
          styles={{
            mt: "1rem",
            width: "40%",
            py: "0.5rem",
            px: "0.75rem",
            fontWeight: 500,
            fontSize: "0.75rem"
          }}
          onClick={handelViewAccount}
          isFullWidth={false}
          data-testid={appBarTestId.appBar.viewAccountBtn}
        />
      </Stack>
      <Button
        buttonStyle={ButtonStyle.TERTIARY}
        startIcon={<Icon name={IconName.SIGNOUT_ICON} />}
        label={translateText(["logout"])}
        styles={{ mt: "1rem" }}
        onClick={handleSignOut}
      />
    </Box>
  );
};

export default ProfileMenu;
