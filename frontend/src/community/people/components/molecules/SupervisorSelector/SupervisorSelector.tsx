import { Box, Stack, Typography } from "@mui/material";
import React, {
  ChangeEvent,
  Dispatch,
  MouseEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState
} from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import AvatarGroup from "~community/common/components/molecules/AvatarGroup/AvatarGroup";
import Popper from "~community/common/components/molecules/Popper/Popper";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { theme } from "~community/common/theme/theme";
import { IconName } from "~community/common/types/IconTypes";
import {
  AvatarPropTypes,
  MenuTypes
} from "~community/common/types/MoleculeTypes";
import {
  shouldActivateButton,
  shouldCollapseDropdown
} from "~community/common/utils/keyboardUtils";
import { EmployeeDataType } from "~community/people/types/EmployeeTypes";
import {
  L1EmployeeType,
  L4ManagerType
} from "~community/people/types/PeopleTypes";

import MultiSelectManagerSearch from "../MultiSelectManagerSearch/MultiSelectManagerSearch";

interface Props {
  employee: L1EmployeeType | null;
  otherSupervisorsCount: number;
  managerSuggestions: EmployeeDataType[];
  managerSearchTerm: string;
  onmanagerSearchChange: (
    e?: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    searchTerm?: string
  ) => Promise<void>;
  selectedManagers: L4ManagerType[];
  setSelectedManagers: Dispatch<SetStateAction<L4ManagerType[]>>;
  isInputsDisabled: boolean;
  label: string;
  filterEl: HTMLElement | null;
  setFilterEl: Dispatch<SetStateAction<HTMLElement | null>>;
  setManagerSearchTerm: Dispatch<SetStateAction<string>>;
  isSearchResultsLoading?: boolean;
}

const SupervisorSelector = ({
  employee,
  otherSupervisorsCount,
  managerSuggestions,
  managerSearchTerm,
  onmanagerSearchChange,
  selectedManagers,
  setSelectedManagers,
  isInputsDisabled,
  label,
  filterEl,
  setFilterEl,
  setManagerSearchTerm,
  isSearchResultsLoading
}: Props) => {
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const filterBeOpen: boolean = filterOpen && Boolean(filterEl);
  const boxRef = useRef<HTMLDivElement>(null);
  const [boxWidth, setBoxWidth] = useState(0);
  const filterId: string | undefined = filterBeOpen
    ? "filter-popper"
    : undefined;

  useEffect(() => {
    if (boxRef.current) {
      setBoxWidth(boxRef.current.clientWidth);
    }
  }, [filterOpen]);

  const handleFilterClose = () => {
    setFilterOpen(false);
    setFilterEl(null);
  };

  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "employmentDetails"
  );

  const translateAria = useTranslator(
    "commonAria",
    "components",
    "avatarSearch"
  );

  const getAriaLabel = () => {
    let baseLabel = label;

    if (!employee?.employment?.employmentDetails?.otherSupervisors?.length) {
      return baseLabel;
    }

    const supervisorNames =
      employee.employment.employmentDetails.otherSupervisors
        .map((supervisor) => `${supervisor.firstName} ${supervisor.lastName}`)
        .join(", ");

    return `${baseLabel} ${translateAria(["currentlySelected"])} ${supervisorNames}`;
  };

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          mt: "0.3rem"
        }}
      >
        <Typography
          variant="placeholder"
          gutterBottom
          sx={{
            color: isInputsDisabled
              ? theme.palette.text.disabled
              : "common.black"
          }}
        >
          {label}
        </Typography>
      </Stack>
      <Box
        ref={boxRef}
        alignItems={"center"}
        tabIndex={isInputsDisabled ? -1 : 0}
        role="combobox"
        aria-expanded={filterOpen}
        aria-haspopup="listbox"
        aria-label={getAriaLabel()}
        sx={{
          backgroundColor: theme.palette.grey[100],
          height: "3rem",
          borderRadius: "0.5rem",
          flexDirection: "row",
          pl: otherSupervisorsCount > 2 ? "0.75rem" : "0rem",
          display: "flex",
          width: "100%",
          cursor: isInputsDisabled ? "default" : "pointer",
          "&:focus": {
            outline: `0.125rem solid ${theme.palette.common.black}`,
            outlineOffset: "-0.125rem"
          }
        }}
        onClick={(event: MouseEvent<HTMLElement>): void => {
          setManagerSearchTerm("");
          setFilterEl(event.currentTarget);
          !isInputsDisabled && setFilterOpen((previousOpen) => !previousOpen);
        }}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>): void => {
          if (isInputsDisabled) return;
          if (shouldActivateButton(event.key)) {
            event.preventDefault();
            setManagerSearchTerm("");
            setFilterEl(event.currentTarget);
            setFilterOpen((previousOpen) => !previousOpen);
          } else if (shouldCollapseDropdown(event.key) && filterOpen) {
            event.preventDefault();
            handleFilterClose();
          }
        }}
      >
        {otherSupervisorsCount === 0 ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              px: "0.75rem"
            }}
          >
            <Typography
              variant="placeholder"
              sx={{
                color: theme.palette.grey[500],
                ml: "0.5rem"
              }}
            >
              {translateText(["selectOtherSupervisors"])}
            </Typography>
          </Box>
        ) : otherSupervisorsCount < 3 ? (
          employee?.employment?.employmentDetails?.otherSupervisors?.map(
            (manager: L4ManagerType) => (
              <Box
                sx={{ height: "3.125rem", pt: "0.3125rem" }}
                key={manager?.employeeId}
                aria-hidden={true}
                tabIndex={-1}
              >
                <AvatarChip
                  firstName={manager?.firstName ?? ""}
                  lastName={
                    employee?.employment?.employmentDetails?.otherSupervisors
                      ?.length === 1
                      ? (manager?.lastName ?? "")
                      : ""
                  }
                  avatarUrl={manager?.authPic}
                  isResponsiveLayout={false}
                  isDeleteAvailable={true}
                  chipStyles={{
                    backgroundColor: "common.white",
                    color: "common.black",
                    height: "2.5rem",
                    "& .MuiChip-deleteIcon": {
                      mr: "0.9375rem"
                    },
                    "& .MuiChip-label": {
                      pl: "0.5rem",
                      ml: "0.25rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden !important",
                      textOverflow: "ellipsis",
                      maxWidth: "11.25rem"
                    },
                    mt: "0rem",
                    ml: "0.75rem"
                  }}
                  isDisabled={isInputsDisabled}
                  tabIndex={-1}
                />
              </Box>
            )
          )
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
              employee?.employment?.employmentDetails?.otherSupervisors
                ? employee?.employment?.employmentDetails?.otherSupervisors?.map(
                    (manager: L4ManagerType) =>
                      ({
                        firstName: manager?.firstName,
                        lastName: manager?.lastName,
                        image: manager?.authPic
                      }) as AvatarPropTypes
                  )
                : []
            }
            max={3}
            isHoverModal={isInputsDisabled}
          />
        )}
        {!isInputsDisabled && (
          <Box sx={{ ml: "auto", mr: "1rem", mt: "0.5rem" }}>
            <Icon name={IconName.SEARCH_ICON} />
          </Box>
        )}
      </Box>
      <Popper
        anchorEl={filterEl}
        open={filterOpen}
        position={"bottom-end"}
        menuType={MenuTypes.FILTER}
        id={filterId}
        handleClose={handleFilterClose}
        timeout={300}
        containerStyles={{
          maxHeight: "20.25rem",
          width: `${boxWidth}px`,
          backgroundColor: theme.palette.notifyBadge.contrastText,
          boxShadow: theme.shadows[1]
        }}
      >
        <MultiSelectManagerSearch
          selectedManagers={selectedManagers}
          setSelectedManagers={setSelectedManagers}
          managerSuggestions={managerSuggestions}
          onManagerSearchChange={onmanagerSearchChange}
          managerSearchTerm={managerSearchTerm}
          isSearchResultsLoading={isSearchResultsLoading}
          filterOpen={filterOpen}
          setFilterOpen={setFilterOpen}
        />
      </Popper>
    </>
  );
};

export default SupervisorSelector;
