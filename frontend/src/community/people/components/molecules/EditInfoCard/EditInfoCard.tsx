import { Box, Stack, type SxProps, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { JSX, useEffect } from "react";
import { type MouseEventHandler, useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";

import { useStorageAvailability } from "~community/common/api/StorageAvailabilityApi";
import LocalPhoneIcon from "~community/common/assets/Icons/LocalPhoneIcon";
import MailIcon from "~community/common/assets/Icons/MailIcon";
import BasicChip from "~community/common/components/atoms/Chips/BasicChip/BasicChip";
import Icon from "~community/common/components/atoms/Icon/Icon";
import Avatar from "~community/common/components/molecules/Avatar/Avatar";
import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import BasicChipGroup from "~community/common/components/molecules/BasicChipGroup/BasicChipGroup";
import KebabMenu from "~community/common/components/molecules/KebabMenu/KebabMenu";
import { appModes } from "~community/common/constants/configs";
import { useScreenSizeRange } from "~community/common/hooks/useScreenSizeRange";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { AdminTypes } from "~community/common/types/AuthTypes";
import { IconName } from "~community/common/types/IconTypes";
import {
  formatDateWithOrdinalIndicator,
  getTimeElapsedSinceDate
} from "~community/common/utils/dateTimeUtils";
import { EIGHTY_PERCENT } from "~community/common/utils/getConstants";
import { useGetAllTeams } from "~community/people/api/TeamApi";
import { AccountStatusEnums } from "~community/people/enums/DirectoryEnums";
import { AccountStatusTypes } from "~community/people/enums/PeopleEnums";
import { usePeopleStore } from "~community/people/store/store";
import { ModifiedFileType } from "~community/people/types/AddNewResourceTypes";
import { EmployeeManagerType } from "~community/people/types/EmployeeTypes";
import { TeamType } from "~community/people/types/TeamTypes";
import generateThumbnail from "~community/people/utils/image/thumbnailGenerator";
import { toPascalCase } from "~community/people/utils/jobFamilyUtils/commonUtils";
import { getStatusStyle } from "~community/people/utils/terminationUtil";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import { useGetSubscriptionCancelImpact } from "~enterprise/settings/api/Billing/subscriptionCancelImpactApi";

interface Props {
  onClick?: MouseEventHandler<HTMLDivElement>;
  styles?: SxProps;
}

const EditInfoCard = ({ onClick, styles }: Props): JSX.Element => {
  const theme: Theme = useTheme();
  const {
    isDesktopScreen,
    isSmallDesktopScreen,
    isTabScreen,
    isPhoneScreen,
    isSmallPhoneScreen
  } = useScreenSizeRange();
  const translateText = useTranslator("peopleModule", "editAllInfo");
  const translateTerminationText = useTranslator("peopleModule", "termination");
  const translateStorageText = useTranslator("StorageToastMessage");
  const deletionTranslateText = useTranslator("peopleModule", "deletion");

  const [teams, setTeams] = useState<TeamType[]>([]);

  const AVAILABLE_FIELD_COUNT = 2;

  const { data } = useSession();

  const { asPath } = useRouter();

  const employeeId = asPath.split("/").pop();

  const {
    initialEmployee,
    employee,
    setProfilePic,
    setThumbnail,
    setCommonDetails,
    setTerminationConfirmationModalOpen,
    setAlertMessage,
    setTerminationAlertModalOpen,
    setDeletionAlertMessage,
    setDeletionAlertOpen,
    setDeletionConfirmationModalOpen
  } = usePeopleStore((state) => state);

  const { data: teamData } = useGetAllTeams();

  useEffect(() => {
    if (teamData) {
      const teams = teamData?.filter((project) =>
        employee?.employment?.employmentDetails?.teamIds?.includes(
          project.teamId as number
        )
      );
      setTeams(teams);
    }
  }, [employee, teamData]);

  const environment = useGetEnvironment();

  const { setToastMessage } = useToast();

  const { data: supervisoryData, refetch } = useGetSubscriptionCancelImpact([
    Number(employeeId)
  ]);

  const { data: storageAvailableData } = useStorageAvailability();
  const hasTerminationAbility =
    data?.user.roles?.includes(AdminTypes.PEOPLE_ADMIN) &&
    data?.user?.userId !== employee?.common?.employeeId &&
    !employee?.systemPermissions?.isSuperAdmin;

  const [supervisor, setSupervisor] = useState<EmployeeManagerType | null>(
    null
  );

  const handleTermination = async () => {
    await refetch();
    if (
      supervisoryData?.primaryManagers?.length ||
      supervisoryData?.teamSupervisors?.length
    ) {
      const condition = {
        managers: supervisoryData?.primaryManagers?.length || 0,
        teams: supervisoryData?.teamSupervisors?.length || 0
      };
      const caseKey = `${condition.managers}-${condition.teams}`;

      switch (caseKey) {
        case "1-0":
          setAlertMessage(
            translateTerminationText([
              "terminateWarningModalDescriptionSingleEmployee"
            ])
          );
          break;
        case "0-1":
          setAlertMessage(
            translateTerminationText([
              "terminateWarningModalDescriptionSingleTeam"
            ])
          );
          break;
        case "1-1":
          setAlertMessage(
            translateTerminationText([
              "terminateWarningModalDescriptionSingleEmployee"
            ])
          );
          break;
        default:
          if (condition.managers > 1) {
            setAlertMessage(
              translateTerminationText([
                "terminateWarningModalDescriptionMultipleEmployees"
              ])
            );
          } else if (condition.teams > 1) {
            setAlertMessage(
              translateTerminationText([
                "terminateWarningModalDescriptionMultipleTeams"
              ])
            );
          }
      }
      setTerminationAlertModalOpen(true);
      return;
    }
    setTerminationConfirmationModalOpen(true);
  };

  const handleDeletion = async () => {
    await refetch();
    if (
      supervisoryData?.primaryManagers?.length ||
      supervisoryData?.teamSupervisors?.length
    ) {
      const condition = {
        managers: supervisoryData?.primaryManagers?.length || 0,
        teams: supervisoryData?.teamSupervisors?.length || 0
      };
      if (condition.managers > 0) {
        setDeletionAlertMessage(
          deletionTranslateText(["deleteWarningPrimarySupervisorDescription"])
        );
      } else if (condition.teams > 0) {
        setDeletionAlertMessage(
          deletionTranslateText(["deleteWarningTeamSupervisorDescription"])
        );
      }
      setDeletionAlertOpen(true);
      return;
    }
    setDeletionConfirmationModalOpen(true);
  };

  const kebabMenuOptions = [
    {
      id: employee?.common?.employeeId || "",
      icon: (
        <Icon
          name={IconName.MINUS_ICON}
          fill={theme.palette.error.contrastText}
        />
      ),
      text: translateTerminationText(["terminateButtonText"]),
      onClickHandler: () => handleTermination(),
      isDisabled:
        employee?.common?.accountStatus === AccountStatusTypes.TERMINATED
    },
    {
      id: employee?.common?.employeeId || "",
      icon: (
        <Icon
          name={IconName.BIN_ICON}
          fill={theme.palette.error.contrastText}
        />
      ),
      text: translateTerminationText(["deleteButtonText"]),
      onClickHandler: () => handleDeletion()
    }
  ];

  const cardData = useMemo(() => {
    return {
      employeeId:
        initialEmployee?.employment?.employmentDetails?.employeeNumber || "1",
      authPic: initialEmployee?.common?.authPic || "",
      firstName: initialEmployee?.personal?.general?.firstName,
      lastName: initialEmployee?.personal?.general?.lastName,
      fullName:
        initialEmployee?.personal?.general?.firstName?.concat(
          " ",
          initialEmployee?.personal?.general?.lastName as string
        ) || "",
      email: initialEmployee?.employment?.employmentDetails?.email || "",
      phone: initialEmployee?.personal?.contact?.contactNo || "",
      countryCode: initialEmployee?.personal?.contact?.countryCode || "",
      jobFamily: "",
      jobTitle: initialEmployee?.common?.jobTitle || "",
      teams: teams || [],
      joinedDate:
        initialEmployee?.employment?.employmentDetails?.joinedDate || "",
      accountStatus: initialEmployee?.common?.accountStatus || ""
    };
  }, [initialEmployee, teams]);

  const employmentStatus = cardData?.accountStatus as AccountStatusEnums;

  const statusStyle = getStatusStyle(employmentStatus);

  const getAvailableFieldCount = (): number => {
    let count = 0;
    if (cardData?.teams.length > 0) count++;
    if (cardData?.joinedDate) count++;
    if (supervisor) count++;
    return count;
  };

  const getTelNo = (): string => {
    return cardData?.countryCode === cardData?.phone
      ? "+".concat(cardData?.countryCode)
      : "+".concat(cardData?.countryCode).concat(" ", cardData?.phone);
  };

  const getTeams = (): string[] => {
    return cardData?.teams?.map((team) => team?.teamName).sort();
  };

  const getDate = (): string => {
    return formatDateWithOrdinalIndicator(new Date(cardData?.joinedDate));
  };

  const onDrop: (acceptedFiles: File[]) => void = useCallback(
    (acceptedFiles: File[]) => {
      if (
        environment === appModes.ENTERPRISE ||
        (environment === appModes.COMMUNITY &&
          storageAvailableData?.availableSpace <= EIGHTY_PERCENT)
      ) {
        const profilePic = acceptedFiles.map((file: File) =>
          Object.assign(file, { preview: URL.createObjectURL(file) })
        );
        setCommonDetails({
          authPic: profilePic[0]?.preview ?? ""
        });

        setProfilePic(profilePic as ModifiedFileType[]);
        generateThumbnail(profilePic[0] as ModifiedFileType).then((thumbnail) =>
          setThumbnail(thumbnail)
        );
      } else {
        setToastMessage({
          open: true,
          toastType: "error",
          title: translateStorageText(["storageTitle"]),
          description: translateStorageText(["contactAdminText"]),
          isIcon: true
        });
      }
    },
    [storageAvailableData?.availableSpace]
  );

  const { open, getInputProps } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: {
      "image/svg+xml": [],
      "image/png": [],
      "image/jpg": [],
      "image/jpeg": []
    }
  });

  const handleUnSelectPhoto = (): void => {
    setProfilePic([]);
    setThumbnail([]);
    setCommonDetails({
      authPic: ""
    });
  };

  // useEffect(() => {
  //   const supervisor = selectedEmployee?.employees?.find(
  //     (manager: EmployeeManagerType) =>
  //       manager?.managerType === ManagerTypes.PRIMARY
  //   );

  //   setSupervisor(supervisor as EmployeeManagerType);
  // }, [selectedEmployee]);

  const openFileBrowser = () => {
    if (storageAvailableData?.availableSpace <= EIGHTY_PERCENT) {
      open();
    } else {
      setToastMessage({
        open: true,
        toastType: "error",
        title: translateStorageText(["storageTitle"]),
        description: translateStorageText(["contactAdminText"]),
        isIcon: true
      });
    }
  };

  const getAvatarThumbnailUrl = useCallback((): string => {
    if (employee?.common?.authPic !== undefined) {
      if (Array.isArray(employee?.common?.authPic)) {
        return employee?.common?.authPic[0]?.preview;
      }

      return employee?.common?.authPic ?? "";
    } else if (cardData?.authPic !== undefined) {
      if (Array.isArray(cardData?.authPic)) {
        return cardData?.authPic[0]?.preview;
      }
      return cardData?.authPic ?? "";
    }

    return "";
  }, [cardData?.authPic, employee?.common?.authPic]);

  return (
    <Stack
      sx={{
        mb: "2rem",
        display: "flex",
        flexDirection: "row",
        alignItems:
          getAvailableFieldCount() >= AVAILABLE_FIELD_COUNT || supervisor
            ? "center"
            : "flex-start",
        justifyContent: "space-between",
        background: theme.palette.grey[100],
        padding: "1.5rem 1rem",
        pr: "2.625rem",
        borderRadius: "0.75rem",
        gap: "1rem",
        position: "relative",
        ...styles
      }}
      onClick={onClick}
    >
      <Stack
        direction="row"
        gap="1rem"
        sx={{
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Avatar
          id="avatar"
          src={getAvatarThumbnailUrl()}
          avatarStyles={{
            width: "6.125rem",
            height: "6.125rem",
            border: "none"
          }}
          isOriginalImage={true}
          firstName={cardData?.firstName ?? ("" as string)}
          lastName={cardData?.lastName ?? ("" as string)}
          getInputProps={getInputProps}
          handleUnSelectPhoto={handleUnSelectPhoto}
          open={openFileBrowser}
          enableEdit={
            employee?.common?.accountStatus !==
            AccountStatusEnums.TERMINATED.toUpperCase()
          }
          imageUploaded={
            cardData?.authPic !== ((employee?.common?.authPic as string) ?? "")
          }
        />
        <Stack direction="column" alignItems="flex-start" gap="1rem">
          <Stack direction="column" alignItems="flex-start" gap="0.125rem">
            <Typography variant="h2">
              {`${cardData?.firstName} ${cardData?.lastName}`}
            </Typography>
            <Typography
              variant="placeholder"
              sx={{
                color: theme.palette.text.secondary
              }}
            >
              {cardData?.jobTitle}
            </Typography>
          </Stack>

          <Stack
            direction={
              isDesktopScreen ||
              isSmallDesktopScreen ||
              isTabScreen ||
              isPhoneScreen ||
              isSmallPhoneScreen
                ? "column"
                : "row"
            }
            alignItems="flex-start"
            gap="0.5rem"
          >
            {cardData?.email && (
              <Stack
                direction="row"
                alignItems="center"
                gap="0.5rem"
                justifyContent={"flex-start"}
                sx={{
                  display: !cardData?.email ? "none" : "flex"
                }}
              >
                <MailIcon />
                <Typography variant="caption">{cardData?.email}</Typography>
              </Stack>
            )}
            {getTelNo() !== "+" && (
              <Stack
                direction="row"
                alignItems="center"
                gap="0.5rem"
                justifyContent={"flex-start"}
              >
                <LocalPhoneIcon />
                <Typography variant="caption">{getTelNo()}</Typography>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>

      <Stack
        direction={isPhoneScreen || isSmallPhoneScreen ? "column" : "row"}
        gap={
          isTabScreen ||
          isPhoneScreen ||
          isSmallPhoneScreen ||
          getAvailableFieldCount() === 1
            ? "1rem"
            : "2.25rem"
        }
      >
        <Stack direction="column" alignItems="flex-start" gap="1rem">
          {cardData?.joinedDate && (
            <Stack
              direction="column"
              alignItems="flex-start"
              gap="0.25rem"
              justifyContent={"flex-start"}
            >
              <Typography variant="caption">
                {translateText(["joinedDate"])}
              </Typography>
              <Stack
                direction={
                  isPhoneScreen || isSmallPhoneScreen ? "column" : "row"
                }
                gap={
                  isPhoneScreen || isSmallPhoneScreen ? "0.25rem" : "0.625rem"
                }
                alignItems={
                  isPhoneScreen || isSmallPhoneScreen ? "flex-start" : "center"
                }
              >
                <Typography variant="body2">{getDate()}</Typography>
                <BasicChip
                  label={getTimeElapsedSinceDate(cardData?.joinedDate)}
                  tabIndex={-1}
                  ariaHidden={true}
                  chipStyles={{
                    color: "common.black",
                    fontWeight: 400,
                    fontSize: "0.75rem",
                    padding: "0.25rem 0.5rem",
                    backgroundColor: theme.palette.grey[200],
                    borderRadius: "4rem",
                    marginBottom: "0.1rem"
                  }}
                />
              </Stack>
            </Stack>
          )}
          {cardData?.teams?.length > 0 && (
            <Stack
              direction="column"
              alignItems="flex-start"
              gap="0.25rem"
              justifyContent={"flex-start"}
            >
              <Typography variant="caption">
                {translateText(["teams"])}
              </Typography>
              <BasicChipGroup
                values={getTeams()}
                chipStyles={{
                  color: "common.black",
                  fontWeight: 400,
                  fontSize: "0.75rem",
                  lineHeight: "1rem",
                  padding: "0.25rem 0.5rem",
                  backgroundColor: theme.palette.grey[200],
                  borderRadius: "4rem"
                }}
                max={3}
                showHoverModal
                modalPosition={"right"}
              />
            </Stack>
          )}
        </Stack>

        <Stack direction="column" justifyContent={"space-between"} gap="1rem">
          <Stack direction="column" justifyContent={"space-between"} gap="1rem">
            <Stack
              direction="column"
              alignItems="flex-start"
              gap="0.25rem"
              justifyContent={"flex-start"}
            >
              <Stack
                direction="row"
                justifyContent={"space-between"}
                alignItems={"center"}
                width="100%"
              >
                <Typography variant="caption">
                  {translateTerminationText(["status"])} :
                </Typography>
                {employmentStatus !==
                  AccountStatusEnums.TERMINATED.toUpperCase() &&
                  hasTerminationAbility && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "1.5rem",
                        right: "1rem"
                      }}
                    >
                      <KebabMenu
                        id="add-team-kebab-menu"
                        menuItems={kebabMenuOptions}
                        icon={<Icon name={IconName.THREE_DOTS_ICON} />}
                        customStyles={{
                          menuItemText: {
                            color: theme.palette.error.contrastText
                          }
                        }}
                      />
                    </Box>
                  )}
              </Stack>
              <Box
                tabIndex={0}
                aria-label={`${translateTerminationText(["status"])} : ${toPascalCase(employmentStatus)}`}
              >
                <BasicChip
                  label={toPascalCase(employmentStatus)}
                  tabIndex={-1}
                  ariaHidden={true}
                  chipStyles={{
                    color: statusStyle?.color || "common.black",
                    fontWeight: 400,
                    fontSize: "0.75rem",
                    lineHeight: "1rem",
                    padding: "0.25rem 0.5rem",
                    backgroundColor:
                      statusStyle?.backgroundColor || theme.palette.grey[200],
                    borderRadius: "4rem"
                  }}
                />
              </Box>
            </Stack>
            {supervisor && (
              <Stack
                direction="column"
                alignItems="flex-start"
                gap="0.25rem"
                justifyContent={"flex-start"}
              >
                <Typography variant="caption">
                  {translateText(["primarySupervisor"])}
                </Typography>
                <AvatarChip
                  firstName={supervisor?.manager?.firstName ?? ""}
                  lastName={supervisor?.manager?.lastName ?? ""}
                  avatarUrl={supervisor?.manager?.authPic ?? ""}
                  chipStyles={{
                    color: theme.palette.grey[700],
                    "& .MuiChip-label": {
                      pr: "0.5rem"
                    }
                  }}
                  isResponsiveLayout
                  smallScreenWidth={625}
                />
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default EditInfoCard;
