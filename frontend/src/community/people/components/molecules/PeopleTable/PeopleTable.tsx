import { Box, Stack, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  FC,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import InviteIcon from "~community/common/assets/Icons/InviteIcon";
import Button from "~community/common/components/atoms/Button/Button";
import ReadOnlyChip from "~community/common/components/atoms/Chips/BasicChip/ReadOnlyChip";
import Icon from "~community/common/components/atoms/Icon/Icon";
import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import AvatarGroup from "~community/common/components/molecules/AvatarGroup/AvatarGroup";
import Table from "~community/common/components/molecules/Table/Table";
import ROUTES from "~community/common/constants/routes";
import {
  ButtonSizes,
  ButtonStyle,
  ToastType
} from "~community/common/enums/ComponentEnums";
import { TableNames } from "~community/common/enums/Table";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { AdminTypes, ManagerTypes } from "~community/common/types/AuthTypes";
import {
  SortKeyTypes,
  SortOrderTypes
} from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { AvatarPropTypes } from "~community/common/types/MoleculeTypes";
import { testPassiveEventSupport } from "~community/common/utils/commonUtil";
import { useGetAllJobFamilies } from "~community/people/api/JobFamilyApi";
import {
  useGetUserPersonalDetails,
  useHandleReviteEmployees
} from "~community/people/api/PeopleApi";
import { useGetAllTeams } from "~community/people/api/TeamApi";
import PeopleTableFilterBy from "~community/people/components/molecules/PeopleTable/PeopleTableFilterBy";
import { usePeopleStore } from "~community/people/store/store";
import { EditPeopleFormTypes } from "~community/people/types/PeopleEditTypes";
import {
  AllEmployeeDataType,
  EmployeeDataTeamType
} from "~community/people/types/PeopleTypes";
import { TeamNamesType } from "~community/people/types/TeamTypes";
import {
  GetFamilyFilterPreProcessor,
  GetTeamPreProcessor,
  refactorTeamListData
} from "~community/people/utils/PeopleDirectoryUtils";

import PeopleTableSortBy from "../PeopleTableHeaders/PeopleTableSortBy";
import ReinviteConfirmationModal from "../ReinviteConfirmationModal/ReinviteConfirmationModal";

interface Props {
  employeeData: AllEmployeeDataType[];
  fetchNextPage: () => void;
  isFetching?: boolean;
  isFetchingNextPage?: boolean;
  onSearch: boolean;
  hasNextPage?: boolean;
  isRemovePeople?: boolean;
}

const PeopleTable: FC<Props> = ({
  employeeData,
  fetchNextPage,
  isFetching,
  isFetchingNextPage,
  onSearch,
  hasNextPage,
  isRemovePeople = false
}) => {
  const theme: Theme = useTheme();
  const { data } = useSession();
  const router = useRouter();
  const { setToastMessage } = useToast();
  const translateText = useTranslator("peopleModule", "peoples");
  const translateAria = useTranslator("peopleAria", "directory");

  const isPeopleManagerOrSuperAdmin = data?.user.roles?.includes(
    ManagerTypes.PEOPLE_MANAGER || AdminTypes.SUPER_ADMIN
  );

  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [filterEl, setFilterEl] = useState<null | HTMLElement>(null);
  const [sortType, setSortType] = useState<string>("A to Z");
  const [filter, setFilter] = useState<boolean>(false);
  const [selectedPeople, setSelectedPeople] = useState<number[]>([]);

  const filterByOpen: boolean = filterOpen && Boolean(filterEl);
  const filterId: string | undefined = filterByOpen
    ? "filter-popper"
    : undefined;

  const {
    isPendingInvitationListOpen,
    setIsFromPeopleDirectory,
    setViewEmployeeId,
    setSelectedEmployees,
    employeeDataParams,
    setProjectTeamNames,
    setSelectedEmployeeId,
    resetEmployeeData,
    resetEmployeeDataChanges,
    setIsReinviteConfirmationModalOpen,
    setCurrentStep,
    setNextStep,
    resetPeopleSlice
  } = usePeopleStore((state) => state);

  const { data: teamData, isLoading } = useGetAllTeams();
  const { data: jobFamilyData, isLoading: jobFamilyLoading } =
    useGetAllJobFamilies();
  const { data: currentEmployeeDetails } = useGetUserPersonalDetails();
  const onSuccess = () => {
    setSelectedPeople([]);
    setIsReinviteConfirmationModalOpen(false);
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["reInvitationSuccessTitle"]),
      description: translateText(["reInvitationSuccessDescription"]),
      isIcon: true
    });
  };
  const onError = () => {
    setIsReinviteConfirmationModalOpen(false);
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["reInvitationErrorTitle"]),
      description: translateText(["reInvitationErrorDescription"]),
      isIcon: true
    });
  };
  const { mutate: handlReviteEmployees } = useHandleReviteEmployees(
    onSuccess,
    onError
  );

  const listInnerRef = useRef<HTMLDivElement>();
  const supportsPassive = testPassiveEventSupport();

  useEffect(() => {
    setSelectedEmployees(selectedPeople);
  }, [selectedPeople]);

  const handleFilterClick = (event: MouseEvent<HTMLElement>): void => {
    setFilterEl(event.currentTarget);
    setFilterOpen((previousOpen) => !previousOpen);
  };

  const handleFilterClose = (value?: boolean): void => {
    setFilterOpen(false);
    if (value) setFilter(true);
    else setFilter(false);
  };

  const scrollToTop = () => {
    if (listInnerRef.current) {
      listInnerRef.current.scrollTop = 0;
    }
  };

  const tableHeadStyles = {
    borderTopLeftRadius: "0.625rem",
    borderTopRightRadius: "0.625rem"
  };

  const tableHeaderCellStyles = {
    border: "none"
  };

  const tableContainerStyles = {
    borderRadius: "0.625rem",
    overflow: "auto"
  };

  const columns = [
    { field: "name", headerName: translateText(["tableHeaders", "name"]) },
    {
      field: "jobTitle",
      headerName: translateText(["tableHeaders", "jobTitle"])
    },
    { field: "email", headerName: translateText(["tableHeaders", "email"]) },
    { field: "team", headerName: translateText(["tableHeaders", "team"]) },
    {
      field: "supervisor",
      headerName: translateText(["tableHeaders", "supervisor"])
    }
  ];

  const tableHeaders = columns.map((col) => ({
    id: col.field,
    label: col.headerName
  }));

  const transformToTableRows = useCallback(() => {
    const tableRowData = employeeData
      ?.filter(
        (employee: AllEmployeeDataType) =>
          !isRemovePeople ||
          String(employee?.employeeId) !==
            String(currentEmployeeDetails?.employeeId)
      )
      .map((employee: AllEmployeeDataType) => ({
        id: employee?.employeeId,
        ariaLabel: translateAria(
          [
            isPendingInvitationListOpen
              ? "peopleTableRowPending"
              : "peopleTableRow"
          ],
          {
            name: `${employee?.firstName} ${employee?.lastName}`,
            jobTitle: employee?.jobTitle
              ? employee?.jobTitle
              : translateAria(["null"]),
            email: employee?.email,
            teams:
              employee?.teams && employee.teams.length > 0
                ? employee.teams.map((team) => team.teamName).join(", ")
                : translateAria(["null"]),
            supervisor:
              employee?.managers && employee.managers.length > 0
                ? employee?.managers
                    ?.map(
                      (manager) => `${manager.firstName} ${manager.lastName}`
                    )
                    .join(", ")
                : translateAria(["null"])
          }
        ),

        name: (
          <Stack flexDirection={"row"} gap={1} alignItems={"center"}>
            <AvatarChip
              firstName={employee?.firstName ?? ""}
              lastName={employee?.lastName ?? ""}
              avatarUrl={employee?.authPic}
              isResponsiveLayout={true}
              chipStyles={{
                color: employee?.isActive
                  ? "common.black"
                  : theme.palette.grey[700],
                maxWidth: isPendingInvitationListOpen ? "9.5rem" : "12.625rem",
                "& .MuiChip-label": {
                  pr: "0.3rem"
                }
              }}
            />
            {isPendingInvitationListOpen && (
              <Stack
                sx={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 1,
                  backgroundColor: theme.palette.amber.light,
                  color: theme.palette.amber.dark,
                  padding: "0.25rem",
                  borderRadius: 10,
                  fontSize: "0.625rem"
                }}
              >
                <Icon
                  name={IconName.CLOCK_ICON}
                  fill={theme.palette.amber.dark}
                />
                {translateText(["Pending"])}
              </Stack>
            )}
          </Stack>
        ),
        jobTitle: (
          <Typography sx={{ wordBreak: "break-all" }} variant="body2">
            {employee?.jobTitle}
          </Typography>
        ),
        email: <Typography variant="body2">{employee?.email}</Typography>,
        team:
          employee?.teams?.length === 0 ? (
            <>-</>
          ) : (
            <Stack
              sx={{
                gap: 1,
                flexDirection: "row",
                width: "100%"
              }}
            >
              {refactorTeamListData(employee?.teams as EmployeeDataTeamType[])
                ?.firstTeamName && (
                <Box width="100%">
                  <ReadOnlyChip
                    label={
                      refactorTeamListData(
                        employee?.teams as EmployeeDataTeamType[]
                      ).firstTeamName
                    }
                    isResponsive={true}
                    chipStyles={{
                      maxWidth:
                        (employee?.teams ?? []).length > 1 ? "10rem" : "full"
                    }}
                  />
                </Box>
              )}

              {refactorTeamListData(employee?.teams as EmployeeDataTeamType[])
                .otherTeamCount >= 1 && (
                <Box width="100%">
                  <ReadOnlyChip
                    chipStyles={{
                      color: theme.palette.primary.dark
                    }}
                    label={
                      (`+ ` +
                        refactorTeamListData(
                          employee?.teams as EmployeeDataTeamType[]
                        ).otherTeamCount) as unknown as string
                    }
                    isResponsive={true}
                  />
                </Box>
              )}
            </Stack>
          ),
        supervisor:
          employee?.managers?.length === 0 ? (
            <>{translateText(["noSupervisor"])}</>
          ) : (
            <AvatarGroup
              componentStyles={{
                ".MuiAvatarGroup-avatar": {
                  bgcolor: theme.palette.grey[100],
                  color: theme.palette.primary.dark,
                  fontSize: "0.875rem",
                  height: "2.5rem",
                  width: "2.5rem",
                  fontWeight: 400,
                  flexDirection: "row-reverse"
                }
              }}
              avatars={
                employee?.managers
                  ? [...employee.managers]
                      .sort((a, b) => {
                        if (a?.isPrimaryManager && !b?.isPrimaryManager)
                          return -1;
                        if (!a?.isPrimaryManager && b?.isPrimaryManager)
                          return 1;
                        return (a?.firstName ?? "").localeCompare(
                          b?.firstName ?? ""
                        );
                      })
                      .map(
                        (supervisor) =>
                          ({
                            firstName: supervisor?.firstName,
                            lastName: supervisor?.lastName,
                            image: supervisor?.authPic
                          }) as AvatarPropTypes
                      )
                  : []
              }
              max={3}
              isHoverModal={true}
            />
          )
      }));

    return tableRowData;
  }, [
    currentEmployeeDetails?.employeeId,
    employeeData,
    isPendingInvitationListOpen,
    isRemovePeople
  ]);

  useEffect(() => {
    if (!isLoading && teamData)
      setProjectTeamNames(teamData as TeamNamesType[]);
  }, [isLoading, teamData]);

  const handleRowClick = async (employee: { id: number }) => {
    resetPeopleSlice();
    if (
      currentEmployeeDetails?.employeeId === employee.id.toString() &&
      !isPeopleManagerOrSuperAdmin
    ) {
      resetEmployeeDataChanges();
      resetEmployeeData();
      setSelectedEmployeeId(employee.id);
      setCurrentStep(EditPeopleFormTypes.personal);
      setNextStep(EditPeopleFormTypes.personal);
      router.push(ROUTES.PEOPLE.ACCOUNT);
    } else if (isPeopleManagerOrSuperAdmin) {
      setSelectedEmployeeId(employee.id);
      setCurrentStep(EditPeopleFormTypes.personal);
      setNextStep(EditPeopleFormTypes.personal);
      router.push(ROUTES.PEOPLE.EDIT(employee.id));
    } else {
      setIsFromPeopleDirectory(true);
      setViewEmployeeId(employee.id);
      setCurrentStep(EditPeopleFormTypes.personal);
      setNextStep(EditPeopleFormTypes.personal);
      const route = `${ROUTES.PEOPLE.INDIVIDUAL}/${employee.id}`;
      router.push(route);
    }
  };

  const onScroll = () => {
    if (listInnerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listInnerRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight;
      if (isNearBottom && !isFetchingNextPage && hasNextPage) {
        fetchNextPage();
      }
    }
  };

  useEffect(() => {
    const listInnerElement = listInnerRef.current;

    if (!isFetchingNextPage && listInnerElement) {
      listInnerElement.addEventListener(
        "touchmove",
        onScroll,
        supportsPassive ? { passive: true } : false
      );

      listInnerElement?.addEventListener(
        "wheel",
        onScroll,
        supportsPassive ? { passive: true } : false
      );

      return () => {
        listInnerElement?.removeEventListener("touchmove", onScroll);
        listInnerElement?.removeEventListener("wheel", onScroll);
      };
    }
  }, [isFetchingNextPage, hasNextPage]);

  useEffect(() => {
    switch (employeeDataParams.sortKey) {
      case SortKeyTypes.NAME:
        setSortType(
          employeeDataParams.sortOrder === SortOrderTypes.ASC
            ? translateText(["AlphabeticalAsc"])
            : translateText(["AlphabeticalDesc"])
        );
        break;
      case SortKeyTypes.JOIN_DATE:
        setSortType(
          employeeDataParams.sortOrder === SortOrderTypes.ASC
            ? translateText(["DateAsc"])
            : translateText(["DateDesc"])
        );
        break;
      default:
        setSortType(translateText(["AlphabeticalAsc"]));
        break;
    }
  }, [employeeDataParams.sortKey, employeeDataParams.sortOrder, translateText]);

  const handleCheckBoxClick = (employeeId: number) => () => {
    setSelectedPeople((prevSelectedPeople) => {
      if (!prevSelectedPeople.includes(employeeId)) {
        return [...prevSelectedPeople, employeeId];
      } else {
        return prevSelectedPeople.filter(
          (selectedId) => selectedId !== employeeId
        );
      }
    });
  };

  const handleAllCheckBoxClick = () => {
    if (selectedPeople.length === employeeData?.length) {
      setSelectedPeople([]);
    } else {
      setSelectedPeople(
        employeeData?.map((employee) => employee.employeeId || 0) || []
      );
    }
  };

  const isSelectAllCheckboxChecked = useMemo(() => {
    return selectedPeople?.length === employeeData?.length;
  }, [selectedPeople, employeeData]);

  return (
    <Box
      sx={{
        mt: isPendingInvitationListOpen ? "1.5rem" : "0rem",
        backgroundColor: theme.palette.grey[100],
        display: "flex",
        flexDirection: "column",
        borderRadius: "0.5rem",
        gap: "0.125rem"
      }}
      role="region"
      aria-label={translateAria(["directoryTable"])}
    >
      <Box ref={listInnerRef}>
        <Table
          tableName={TableNames.PEOPLE}
          headers={tableHeaders}
          rows={transformToTableRows()}
          isLoading={isFetching && !isFetchingNextPage}
          selectedRows={selectedPeople}
          checkboxSelection={{
            isEnabled: isPendingInvitationListOpen || isRemovePeople,
            isSelectAllEnabled: isPendingInvitationListOpen || !isRemovePeople,
            isSelectAllVisible: true,
            isSelectAllChecked: isSelectAllCheckboxChecked,
            handleIndividualSelectClick: handleCheckBoxClick,
            handleSelectAllClick: handleAllCheckBoxClick
          }}
          customStyles={{
            wrapper: {
              overflow: "hidden"
            },
            container: tableContainerStyles
          }}
          actionToolbar={{
            firstRow: {
              leftButton:
                isPeopleManagerOrSuperAdmin && !isRemovePeople ? (
                  <PeopleTableSortBy sortType={sortType} />
                ) : undefined,
              rightButton: isPendingInvitationListOpen ? (
                <Button
                  label={translateText(["reinviteButtonTitle"])}
                  buttonStyle={ButtonStyle.SECONDARY}
                  size={ButtonSizes.MEDIUM}
                  endIcon={<InviteIcon />}
                  onClick={() => {
                    setIsReinviteConfirmationModalOpen(true);
                  }}
                  isStrokeAvailable={true}
                  disabled={selectedPeople.length === 0}
                />
              ) : isPeopleManagerOrSuperAdmin && !isRemovePeople ? (
                <PeopleTableFilterBy
                  filterEl={filterEl}
                  handleFilterClose={handleFilterClose}
                  handleFilterClick={handleFilterClick}
                  disabled={isPendingInvitationListOpen}
                  filterId={filterId}
                  filterOpen={filterOpen}
                  scrollToTop={scrollToTop}
                  teams={
                    teamData && !isLoading && GetTeamPreProcessor(teamData)
                  }
                  jobFamilies={
                    jobFamilyData &&
                    !jobFamilyLoading &&
                    GetFamilyFilterPreProcessor(jobFamilyData)
                  }
                />
              ) : undefined
            }
          }}
          tableHead={{
            customStyles: {
              row: tableHeadStyles,
              cell: tableHeaderCellStyles
            }
          }}
          tableBody={{
            loadingState: {
              skeleton: {
                rows: 5
              }
            },
            emptyState: {
              noData: {
                title:
                  (!employeeData?.length && onSearch) ||
                  (onSearch && isRemovePeople && employeeData?.length === 1)
                    ? translateText(["emptySearchResult", "title"])
                    : !employeeData?.length && filter
                      ? isPendingInvitationListOpen
                        ? translateText(["emptyPendingList", "title"])
                        : translateText(["emptyFilterResult", "title"])
                      : !employeeData?.length ||
                          (isRemovePeople && employeeData?.length === 1)
                        ? translateText(["emptyEmployeeData", "title"])
                        : undefined,
                description:
                  (!employeeData?.length && onSearch) ||
                  (onSearch && isRemovePeople && employeeData?.length === 1)
                    ? translateText(["emptySearchResult", "description"])
                    : !employeeData?.length && filter
                      ? isPendingInvitationListOpen
                        ? translateText(["emptyPendingList", "description"])
                        : translateText(["emptyFilterResult", "description"])
                      : !employeeData?.length ||
                          (isRemovePeople && employeeData?.length === 1)
                        ? translateText(["emptyEmployeeData", "description"])
                        : undefined
              }
            },
            onRowClick: !isRemovePeople ? handleRowClick : undefined,
            customStyles: {
              row: {
                active: {
                  "&:hover": {
                    cursor: isRemovePeople ? "default" : "pointer"
                  }
                }
              }
            }
          }}
          tableFoot={{
            pagination: {
              isEnabled: false
            }
          }}
        />
      </Box>
      <ReinviteConfirmationModal
        onCancel={() => setIsReinviteConfirmationModalOpen(false)}
        onClick={() => handlReviteEmployees(selectedPeople)}
        title={translateText(["reInvitenConfirmationModalTitle"])}
        description={translateText(["reInvitenConfirmationModalDescription"])}
      />
    </Box>
  );
};

export default PeopleTable;
