import { SmallModal } from "@rootcodelabs/skapp-ui";
import { FC, ReactNode, useState } from "react";

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
import { hasCustomWorkLocations } from "~community/people/utils/holidayUtils/commonUtils";
import { QuickSetupModalTypeEnums } from "~enterprise/common/enums/Common";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";

const HolidayModalController: FC = () => {
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
    if (
      holidayModalType === holidayModalTypes.HOLIDAY_BULK_DELETE ||
      holidayModalType === holidayModalTypes.HOLIDAY_INDIVIDUAL_DELETE ||
      holidayModalType === holidayModalTypes.HOLIDAY_SELECTED_DELETE
    ) {
      setIsHolidayModalOpen(false);
      setHolidayModalType(holidayModalTypes.NONE);
      return;
    }

    if (holidayModalType === holidayModalTypes.HOLIDAY_EXIT_CONFIRMATION) {
      return;
    }

    const hasCustomLocations = hasCustomWorkLocations(
      newHolidayDetails.workLocations
    );

    const isEditingHoliday =
      newCalenderDetails?.acceptedFile?.length !== 0 ||
      newHolidayDetails.holidayDate ||
      newHolidayDetails.duration ||
      newHolidayDetails.holidayReason ||
      hasCustomLocations;

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

  const modalContent = (): ReactNode => {
    switch (holidayModalType) {
      case holidayModalTypes.ADD_EDIT_HOLIDAY:
        return (
          <AddEditHolidayModal
            holidays={holidays?.items}
            holidayRefetch={refetch}
          />
        );
      case holidayModalTypes.ADD_CALENDAR:
        return <AddCalendar />;
      case holidayModalTypes.UPLOAD_HOLIDAY_BULK:
        return <UploadHolidayBulk setBulkUploadData={setBulkUploadData} />;
      case holidayModalTypes.UPLOAD_SUMMARY:
        return bulkUploadData &&
          bulkUploadData?.bulkStatusSummary?.failedCount > 0 ? (
          <BulkUploadSummary data={bulkUploadData} />
        ) : null;
      case holidayModalTypes.HOLIDAY_INDIVIDUAL_DELETE:
        return (
          <HolidayBulkDelete
            setIsPopupOpen={setIsHolidayModalOpen}
            type={HolidayDeleteType.INDIVIDUAL}
          />
        );
      case holidayModalTypes.HOLIDAY_SELECTED_DELETE:
        return (
          <HolidayBulkDelete
            setIsPopupOpen={setIsHolidayModalOpen}
            type={HolidayDeleteType.SELECTED}
          />
        );
      case holidayModalTypes.HOLIDAY_BULK_DELETE:
        return (
          <HolidayBulkDelete
            setIsPopupOpen={setIsHolidayModalOpen}
            type={HolidayDeleteType.ALL}
          />
        );
      case holidayModalTypes.HOLIDAY_EXIT_CONFIRMATION:
        return <HolidayExitConfirmationModal />;
      default:
        return null;
    }
  };

  return (
    <SmallModal
      isOpen={isHolidayModalOpen && holidayModalType !== holidayModalTypes.NONE}
      onClose={handleCloseModal}
      modalHeader={getModalTitle()}
      content={modalContent()}
    />
  );
};

export default HolidayModalController;
