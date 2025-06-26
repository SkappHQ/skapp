import { Stack } from "@mui/material";
import Box from "@mui/material/Box";
import { type Theme, useTheme } from "@mui/material/styles";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";

import DeleteButtonIcon from "~community/common/assets/Icons/DeleteButtonIcon";
import Button from "~community/common/components/atoms/Button/Button";
import Table from "~community/common/components/molecules/Table/Table";
import {
  ButtonSizes,
  ButtonStyle
} from "~community/common/enums/ComponentEnums";
import { TableNames } from "~community/common/enums/Table";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { testPassiveEventSupport } from "~community/common/utils/commonUtil";
import { isDateGraterThanToday } from "~community/common/utils/dateTimeUtils";
import SortByDropDown from "~community/people/components/molecules/SortByDropDown/SortByDropDown";
import { usePeopleStore } from "~community/people/store/store";
import { Holiday } from "~community/people/types/HolidayTypes";
import {
  getTableHeaders,
  transformToTableRows
} from "~community/people/utils/holidayUtils/holidayTableComponentUtils";
import {
  getSelectAllCheckboxCheckedStatus,
  getSelectAllCheckboxVisibility,
  handleAddHolidayButtonClick,
  handleBulkDeleteClick,
  handleIndividualDelete,
  handleIndividualSelectClick,
  handleSelectAllCheckboxClick,
  isDeleteButtonDisabled
} from "~community/people/utils/holidayUtils/holidayTableUtils";
import useProductTour from "~enterprise/common/hooks/useProductTour";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";

import { styles } from "./styles";

interface Props {
  holidayData: Holiday[];
  setPopupTitle?: (title: string) => string | undefined;
  isHolidayLoading?: boolean;
  holidaySelectedYear?: string;
  hasNextPage?: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage?: boolean;
  isFetching?: boolean;
}

const HolidayTable: FC<Props> = ({
  holidayData,
  setPopupTitle,
  holidaySelectedYear,
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
  isFetching
}) => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const listInnerRef = useRef<HTMLDivElement>();

  const supportsPassive = testPassiveEventSupport();

  const { isPeopleAdmin } = useSessionData();

  const { destroyDriverObj } = useProductTour();

  const translateText = useTranslator("peopleModule", "holidays");
  const translateAria = useTranslator("peopleAria", "holiday");

  const {
    setIsHolidayModalOpen,
    setHolidayModalType,
    setIndividualDeleteId,
    selectedDeleteIds,
    setSelectedDeleteIds
  } = usePeopleStore((state) => ({
    setIsHolidayModalOpen: state.setIsHolidayModalOpen,
    setHolidayModalType: state.setHolidayModalType,
    setIndividualDeleteId: state.setIndividualDeleteId,
    selectedDeleteIds: state.selectedDeleteIds,
    setSelectedDeleteIds: state.setSelectedDeleteIds
  }));

  const { ongoingQuickSetup, quickSetupCurrentFlowSteps } =
    useCommonEnterpriseStore((state) => ({
      ongoingQuickSetup: state.ongoingQuickSetup,
      quickSetupCurrentFlowSteps: state.quickSetupCurrentFlowSteps
    }));

  const [selectedHolidays, setSelectedHolidays] = useState<number[]>([]);

  useEffect(() => {
    const listInnerElement = listInnerRef.current;

    const onScroll = () => {
      if (listInnerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = listInnerRef.current;
        const isNearBottom = scrollTop + clientHeight >= scrollHeight;
        if (isNearBottom && !isFetchingNextPage && hasNextPage) {
          fetchNextPage();
        }
      }
    };

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
  }, [isFetchingNextPage, hasNextPage, supportsPassive, fetchNextPage]);

  useEffect(() => {
    setSelectedHolidays(selectedDeleteIds);
  }, [selectedDeleteIds]);

  const isRowDisabled = useCallback(
    (id: number) => {
      const holiday = holidayData.find((holiday) => holiday.id === id);

      return !isDateGraterThanToday(holiday?.date || "");
    },
    [holidayData]
  );

  const tableHeaders = useMemo(
    () => getTableHeaders(translateText),
    [translateText]
  );

  const tableRows = useMemo(
    () =>
      transformToTableRows(
        holidayData,
        translateText,
        translateAria,
        isRowDisabled,
        classes.dateWrapper
      ),
    [holidayData, translateText, isRowDisabled, classes.dateWrapper]
  );

  const deleteButtonDisabled = useMemo(
    () => isDeleteButtonDisabled(holidayData),
    [holidayData]
  );

  const isSelectAllCheckboxVisible = useMemo(
    () => getSelectAllCheckboxVisibility(isPeopleAdmin, holidayData),
    [holidayData, isPeopleAdmin]
  );

  const isSelectAllCheckboxChecked = useMemo(
    () => getSelectAllCheckboxCheckedStatus(holidayData, selectedHolidays),
    [holidayData, selectedHolidays]
  );

  return (
    <Stack sx={classes.wrapper}>
      <Box
        role="region"
        aria-label={translateAria(["holidayTable"], {
          year: holidaySelectedYear
        })}
        sx={classes.container}
        ref={listInnerRef}
      >
        <Table
          tableName={TableNames.HOLIDAYS}
          headers={tableHeaders}
          isLoading={isFetching && !isFetchingNextPage}
          rows={tableRows}
          isRowDisabled={isRowDisabled}
          selectedRows={selectedHolidays}
          checkboxSelection={{
            isEnabled: true,
            isSelectAllEnabled: true,
            isSelectAllVisible: isSelectAllCheckboxVisible,
            isSelectAllChecked: isSelectAllCheckboxChecked,
            handleIndividualSelectClick: (id: number) =>
              handleIndividualSelectClick(id, setSelectedHolidays),
            handleSelectAllClick: () =>
              handleSelectAllCheckboxClick(
                holidayData,
                selectedHolidays,
                setSelectedHolidays
              )
          }}
          actionToolbar={{
            firstRow: {
              leftButton: (
                <SortByDropDown
                  listInnerRef={listInnerRef}
                  holidayData={holidayData}
                />
              ),
              rightButton:
                holidayData && holidayData?.length > 0 && isPeopleAdmin ? (
                  <Box>
                    <Button
                      label={
                        selectedHolidays.length
                          ? translateText(["deleteSelectedTitle"])
                          : translateText(["deleteAllTitle"])
                      }
                      buttonStyle={ButtonStyle.SECONDARY}
                      size={ButtonSizes.MEDIUM}
                      startIcon={<DeleteButtonIcon />}
                      onClick={() =>
                        handleBulkDeleteClick(
                          selectedHolidays,
                          setSelectedDeleteIds,
                          setPopupTitle,
                          setIsHolidayModalOpen,
                          setHolidayModalType,
                          translateText
                        )
                      }
                      disabled={deleteButtonDisabled}
                    />
                  </Box>
                ) : undefined
            }
          }}
          tableBody={{
            actionColumn: {
              isEnabled: Boolean(isPeopleAdmin),
              actionBtns: {
                right: isPeopleAdmin
                  ? {
                      styles: { mr: "1rem" },
                      onClick: (holidayId) =>
                        handleIndividualDelete(
                          holidayId,
                          setIndividualDeleteId,
                          setPopupTitle,
                          setIsHolidayModalOpen,
                          setHolidayModalType,
                          translateText
                        )
                    }
                  : undefined
              }
            },
            emptyState: {
              noData: {
                title: translateText(["noHolidaysTitle"], {
                  selectedYear: holidaySelectedYear
                }),
                description: isPeopleAdmin
                  ? translateText(["noHolidayDesForAdmin"])
                  : translateText(["noHolidayDesForNonAdmin"]),
                button: isPeopleAdmin
                  ? {
                      id: "add-holidays-empty-table-screen-button",
                      label: translateText(["addHolidaysBtn"]),
                      onClick: () =>
                        handleAddHolidayButtonClick(
                          setHolidayModalType,
                          setIsHolidayModalOpen,
                          ongoingQuickSetup,
                          destroyDriverObj
                        ),
                      shouldBlink:
                        ongoingQuickSetup.SETUP_HOLIDAYS &&
                        quickSetupCurrentFlowSteps !== null
                    }
                  : undefined
              }
            },
            loadingState: {
              skeleton: {
                rows: 5
              }
            },
            onRowClick: () => {}
          }}
          tableFoot={{
            pagination: {
              isEnabled: false
            }
          }}
          customStyles={{
            container: { border: 0, maxHeight: "32rem" }
          }}
        />
      </Box>
    </Stack>
  );
};

export default HolidayTable;
