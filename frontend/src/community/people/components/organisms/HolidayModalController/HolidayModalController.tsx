import { FC, Fragment, useState } from "react";

import ModalController from "~community/common/components/organisms/ModalController/ModalController";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetAllHolidaysInfinite } from "~community/people/api/HolidayApi";
import AddCalendar from "~community/people/components/molecules/HolidayModals/AddCalendar/AddCalendar";
import AddEditHolidayModal from "~community/people/components/molecules/HolidayModals/AddEditHolidayModal/AddEditHolidayModal";
import BulkUploadSummary from "~community/people/components/molecules/HolidayModals/BulkUploadSummary/BulkUploadSummary";
import HolidayBulkDelete from "~community/people/components/molecules/HolidayModals/HolidayBulkDelete/HolidayBulkDelete";
import HolidayExitConfirmationModal from "~community/people/components/molecules/HolidayModals/HolidayExitConfirmationModal/HolidayConfirmationModal";
import UploadHolidayBulk from "~community/people/components/molecules/HolidayModals/UploadHolidayBulk/UploadHolidayBulk";
import { usePeopleStore } from "~community/people/store/store";
import {
  HolidayDeleteType,
  holidayBulkUploadResponse,
  holidayModalTypes
} from "~community/people/types/HolidayTypes";
import { QuickSetupModalTypeEnums } from "~enterprise/common/enums/Common";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";

import styles from "./styles";

const HolidayModalController: FC = () => {
  const classes = styles();

  const translateText = useTranslator("peopleModule", "holidays");

  const {
    newCalenderDetails,
    newHolidayDetails,
    isHolidayModalOpen,
    holidayModalType,
    selectedYear,
    setIsHolidayModalOpen,
    setHolidayModalType,
    setIsBulkUpload
  } = usePeopleStore((state) => ({
    newCalenderDetails: state.newCalenderDetails,
    newHolidayDetails: state.newHolidayDetails,
    isHolidayModalOpen: state.isHolidayModalOpen,
    holidayModalType: state.holidayModalType,
    selectedYear: state.selectedYear,
    setIsHolidayModalOpen: state.setIsHolidayModalOpen,
    setHolidayModalType: state.setHolidayModalType,
    setIsBulkUpload: state.setIsBulkUpload
  }));

  const {
    ongoingQuickSetup,
    setQuickSetupModalType,
    stopAllOngoingQuickSetup
  } = useCommonEnterpriseStore((state) => ({
    ongoingQuickSetup: state.ongoingQuickSetup,
    setQuickSetupModalType: state.setQuickSetupModalType,
    stopAllOngoingQuickSetup: state.stopAllOngoingQuickSetup
  }));

  const [bulkUploadData, setBulkUploadData] = useState<
    holidayBulkUploadResponse | undefined
  >();

  const { data: holidays, refetch } = useGetAllHolidaysInfinite(selectedYear);

  const getModalTitle = (): string => {
    switch (holidayModalType) {
      case holidayModalTypes.ADD_EDIT_HOLIDAY:
        return translateText(["addHoliday"]);
      case holidayModalTypes.ADD_CALENDAR:
        return translateText(["addHolidays"]);
      case holidayModalTypes.UPLOAD_HOLIDAY_BULK:
        return translateText(["addHolidays"]);
      case holidayModalTypes.HOLIDAY_SELECTED_DELETE:
        return translateText(["confirmDeletion"]);
      case holidayModalTypes.HOLIDAY_BULK_DELETE:
        return translateText(["confirmDeletion"]);
      case holidayModalTypes.HOLIDAY_INDIVIDUAL_DELETE:
        return translateText(["confirmDeletion"]);
      case holidayModalTypes.UPLOAD_SUMMARY:
        return translateText(["uploadSummeryModalTitle"]);
      case holidayModalTypes.HOLIDAY_EXIT_CONFIRMATION:
        return translateText(["deletionConfirmTitle"]);
      default:
        return "";
    }
  };

  const handleCloseModal = (): void => {
    const isEditingHoliday =
      newCalenderDetails?.acceptedFile?.length !== 0 ||
      newHolidayDetails.holidayDate ||
      newHolidayDetails.duration ||
      newHolidayDetails.holidayReason;

    const isExitConfirmationNeeded =
      holidayModalType === holidayModalTypes.UPLOAD_HOLIDAY_BULK ||
      holidayModalType === holidayModalTypes.ADD_EDIT_HOLIDAY;

    setIsBulkUpload(holidayModalType === holidayModalTypes.UPLOAD_HOLIDAY_BULK);

    if (isEditingHoliday && isExitConfirmationNeeded) {
      setHolidayModalType(holidayModalTypes.HOLIDAY_EXIT_CONFIRMATION);
    } else {
      setIsHolidayModalOpen(false);
      setHolidayModalType(holidayModalTypes.NONE);
    }

    if (ongoingQuickSetup.SETUP_HOLIDAYS) {
      stopAllOngoingQuickSetup();
      if (
        holidayModalType === holidayModalTypes.UPLOAD_SUMMARY &&
        bulkUploadData &&
        bulkUploadData?.bulkStatusSummary?.successCount > 0
      ) {
        setQuickSetupModalType(QuickSetupModalTypeEnums.IN_PROGRESS_START_UP);
      }
    }
  };

  return (
    <>
      <ModalController
        isModalOpen={isHolidayModalOpen}
        handleCloseModal={handleCloseModal}
        modalTitle={getModalTitle()}
        isClosable={
          holidayModalType === holidayModalTypes.HOLIDAY_EXIT_CONFIRMATION ||
          holidayModalType === holidayModalTypes.HOLIDAY_BULK_DELETE ||
          holidayModalType === holidayModalTypes.HOLIDAY_INDIVIDUAL_DELETE ||
          holidayModalType === holidayModalTypes.HOLIDAY_SELECTED_DELETE
            ? false
            : true
        }
        setModalType={setHolidayModalType}
        modalContentStyles={
          holidayModalType === holidayModalTypes.ADD_EDIT_HOLIDAY
            ? classes.modalContent
            : {}
        }
      >
        <Fragment>
          {holidayModalType === holidayModalTypes.ADD_EDIT_HOLIDAY && (
            <AddEditHolidayModal
              holidays={holidays?.items}
              holidayRefetch={refetch}
            />
          )}

          {holidayModalType === holidayModalTypes.ADD_CALENDAR && (
            <AddCalendar />
          )}

          {holidayModalType === holidayModalTypes.UPLOAD_HOLIDAY_BULK && (
            <UploadHolidayBulk setBulkUploadData={setBulkUploadData} />
          )}

          {bulkUploadData &&
            holidayModalType === holidayModalTypes.UPLOAD_SUMMARY &&
            bulkUploadData?.bulkStatusSummary?.failedCount > 0 && (
              <BulkUploadSummary data={bulkUploadData} />
            )}

          {holidayModalType === holidayModalTypes.HOLIDAY_INDIVIDUAL_DELETE && (
            <HolidayBulkDelete
              setIsPopupOpen={setIsHolidayModalOpen}
              type={HolidayDeleteType.INDIVIDUAL}
            />
          )}

          {holidayModalType === holidayModalTypes.HOLIDAY_SELECTED_DELETE && (
            <HolidayBulkDelete
              setIsPopupOpen={setIsHolidayModalOpen}
              type={HolidayDeleteType.SELECTED}
            />
          )}

          {holidayModalType === holidayModalTypes.HOLIDAY_BULK_DELETE && (
            <HolidayBulkDelete
              setIsPopupOpen={setIsHolidayModalOpen}
              type={HolidayDeleteType.ALL}
            />
          )}

          {holidayModalType === holidayModalTypes.HOLIDAY_EXIT_CONFIRMATION && (
            <HolidayExitConfirmationModal />
          )}
        </Fragment>
      </ModalController>
    </>
  );
};

export default HolidayModalController;
