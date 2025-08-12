import { Box, Typography } from "@mui/material";
import { FC, useCallback } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
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
      <Box>
        {type === HolidayDeleteType.ALL && (
          <Typography
            id="delete-all-holidays"
            variant="body2"
            sx={{ mt: 1, mb: 1, lineHeight: "1.6rem", fontSize: "1rem" }}
          >
            {translateText(["allHolidayDeleteModalDes"])}
          </Typography>
        )}
        {type === HolidayDeleteType.SELECTED && (
          <Typography
            id="delete-selected-holidays"
            variant="body2"
            sx={{ mt: 1, mb: 1, lineHeight: "1.6rem", fontSize: "1rem" }}
          >
            {translateText(["selectedHolidayDeleteModalDes"])}
          </Typography>
        )}
        {type === HolidayDeleteType.INDIVIDUAL && (
          <Typography
            id="delete-individual-holiday"
            variant="body2"
            sx={{ mt: 1, mb: 1, lineHeight: "1.6rem", fontSize: "1rem" }}
          >
            {translateText(["singleHolidayDeleteModalDes"])}
          </Typography>
        )}
        <Button
          label={
            type !== HolidayDeleteType.INDIVIDUAL
              ? translateText(["deleteHolidays"])
              : translateText(["deleteHoliday"])
          }
          endIcon={<Icon name={IconName.DELETE_BUTTON_ICON} />}
          buttonStyle={ButtonStyle.ERROR}
          styles={{ mt: "1rem" }}
          onClick={() => handleBulkDelete()}
        />
        <Button
          label={translateText(["cancelBtnText"])}
          endIcon={<Icon name={IconName.CLOSE_ICON} />}
          buttonStyle={ButtonStyle.TERTIARY}
          styles={{ mt: "1rem" }}
          onClick={() => setIsPopupOpen(false)}
        />
      </Box>
    </>
  );
};

export default HolidayBulkDelete;
