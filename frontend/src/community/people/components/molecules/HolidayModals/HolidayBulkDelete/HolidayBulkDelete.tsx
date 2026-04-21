import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC, useCallback } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import {
  useDeleteAllHolidays,
  useDeleteSelectedHolidays
} from "~community/people/api/HolidayApi";
import { useHolidayMessages } from "~community/people/constants/configs";
import { usePeopleStore } from "~community/people/store/store";
import { HolidayDeleteType } from "~community/people/types/HolidayTypes";

interface Props {
  setIsPopupOpen: (status: boolean) => void;
  type: string;
}

const HolidayBulkDelete: FC<Props> = ({ setIsPopupOpen, type }) => {
  const {
    individualDeleteId,
    selectedDeleteIds,
    setSelectedDeleteIds,
    selectedYear
  } = usePeopleStore((state) => state);

  const translateText = useTranslator("peopleModule", "holidays");
  const { setToastMessage } = useToast();
  const { PAST_HOLIDAY, LEAVE_REQUEST_COLLISION } = useHolidayMessages();
  const onSuccessMulti = useCallback(() => {
    setIsPopupOpen(false);
    setSelectedDeleteIds([]);
    setToastMessage({
      title: translateText(["selectedHolidayDeleteSuccessTitle"]),
      description: translateText(["selectedHolidayDeleteSuccessDes"]),
      isIcon: true,
      toastType: "success",
      open: true
    });
  }, [setIsPopupOpen, setToastMessage, translateText]);

  const onSuccessIndividual = useCallback(() => {
    setIsPopupOpen(false);
    setToastMessage({
      title: translateText(["singleHolidayDeleteSuccessTitle"]),
      description: translateText(["singleHolidayDeleteSuccessDes"]),
      isIcon: true,
      toastType: "success",
      open: true
    });
  }, [setIsPopupOpen, setToastMessage, translateText]);

  const onSuccessAll = useCallback(() => {
    setIsPopupOpen(false);
    setToastMessage({
      title: translateText(["allHolidayDeleteSuccessTitle"]),
      description: translateText(["allHolidayDeleteSuccessDes"]),
      isIcon: true,
      toastType: "success",
      open: true
    });
  }, [setIsPopupOpen, setToastMessage, translateText]);

  const onError = useCallback(
    (error: string) => {
      if (error === PAST_HOLIDAY) {
        setToastMessage({
          title: PAST_HOLIDAY,
          description: "",
          isIcon: true,
          toastType: "error",
          open: true
        });
      } else if (error === LEAVE_REQUEST_COLLISION) {
        if (
          type === HolidayDeleteType.ALL ||
          type === HolidayDeleteType.SELECTED
        ) {
          setToastMessage({
            title: translateText(["deleteMultipleHolidays", "title"]),
            description: translateText([
              "deleteMultipleHolidays",
              "description"
            ]),
            isIcon: true,
            toastType: "error",
            open: true
          });
        } else if (type === HolidayDeleteType.INDIVIDUAL) {
          setToastMessage({
            title: translateText(["deleteSingleHoliday", "title"]),
            description: translateText(["deleteSingleHoliday", "description"]),
            isIcon: true,
            toastType: "error",
            open: true
          });
        } else {
          setToastMessage({
            title: LEAVE_REQUEST_COLLISION,
            description: "",
            isIcon: true,
            toastType: "error",
            open: true
          });
        }
      } else {
        setToastMessage({
          title: translateText(["holidayCreateFailTitle"]),
          description: translateText(["holidayDeleteFailDes"]),
          isIcon: true,
          toastType: "error",
          open: true
        });
      }
      setIsPopupOpen(false);
    },
    [setIsPopupOpen, setToastMessage, translateText, type]
  );

  const onSuccessSelected = () => {
    type === HolidayDeleteType.INDIVIDUAL
      ? onSuccessIndividual()
      : onSuccessMulti();
  };

  const { mutate: deleteAllMutate } = useDeleteAllHolidays(
    onSuccessAll,
    onError
  );

  const { mutate: deleteSelectedMutate } = useDeleteSelectedHolidays(
    onSuccessSelected,
    onError
  );

  const handleBulkDelete = () => {
    if (type === HolidayDeleteType.ALL) {
      deleteAllMutate(selectedYear);
    } else if (type === HolidayDeleteType.SELECTED) {
      deleteSelectedMutate(selectedDeleteIds);
    } else if (type === HolidayDeleteType.INDIVIDUAL) {
      deleteSelectedMutate([individualDeleteId]);
    }
  };

  return (
    <>
      <div>
        {type === HolidayDeleteType.ALL && (
          <p id="delete-all-holidays" className="my-2">
            {translateText(["allHolidayDeleteModalDes"])}
          </p>
        )}
        {type === HolidayDeleteType.SELECTED && (
          <p id="delete-selected-holidays" className="my-2">
            {translateText(["selectedHolidayDeleteModalDes"])}
          </p>
        )}
        {type === HolidayDeleteType.INDIVIDUAL && (
          <p id="delete-individual-holiday" className="my-2">
            {translateText(["singleHolidayDeleteModalDes"])}
          </p>
        )}
        <div className="flex flex-row justify-end gap-3 mt-4">
          <ButtonV2
            variant={"tertiary"}
            onClick={() => setIsPopupOpen(false)}
            icon={<Icon name={IconName.CLOSE_ICON} />}
            iconPosition="end"
          >
            {translateText(["cancelBtnText"])}
          </ButtonV2>
          <ButtonV2
            variant={"error"}
            onClick={() => handleBulkDelete()}
            icon={
              <Icon
                name={IconName.DELETE_BUTTON_ICON}
                fill="var(--color-primary-text)"
              />
            }
            iconPosition="end"
          >
            {type !== HolidayDeleteType.INDIVIDUAL
              ? translateText(["deleteHolidays"])
              : translateText(["deleteHoliday"])}
          </ButtonV2>
        </div>
      </div>
    </>
  );
};

export default HolidayBulkDelete;
