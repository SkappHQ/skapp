import { Divider, Stack, Theme, Typography, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useFormik } from "formik";
import { DateTime } from "luxon";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import ColorPaletteSkeleton from "~community/common/components/atoms/ColorPaletteSkeleton/ColorPaletteSkeleton";
import DescribedSelection from "~community/common/components/atoms/DescribedSelection/DescribedSelection";
import SwitchRow from "~community/common/components/atoms/SwitchRow/SwitchRow";
import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import ColorPalette from "~community/common/components/molecules/ColorPalette/ColorPalette";
import EmojiPicker from "~community/common/components/molecules/EmojiPicker/EmojiPicker";
import Form from "~community/common/components/molecules/Form/Form";
import InputDate from "~community/common/components/molecules/InputDate/InputDate";
import InputField from "~community/common/components/molecules/InputField/InputField";
import { characterLengths } from "~community/common/constants/stringConstants";
import { MONTH_DATE_FORMAT } from "~community/common/constants/timeConstants";
import {
  ButtonStyle,
  ButtonTypes
} from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { specialCharacters } from "~community/common/regex/regexPatterns";
import { IconName } from "~community/common/types/IconTypes";
import { getEmoji } from "~community/common/utils/commonUtil";
import {
  currentYear,
  getLocalDate
} from "~community/common/utils/dateTimeUtils";
import { useGetLeaveCycle } from "~community/leave/api/LeaveApi";
import {
  useAddLeaveType,
  useEditLeaveType
} from "~community/leave/api/LeaveTypesApi";
import ConfirmLeaveTypeStatusUpdateModal from "~community/leave/components/molecules/UserPromptModals/ConfirmLeaveTypeStatusUpdateModal/ConfirmLeaveTypeStatusUpdateModal";
import { leaveTypeColors } from "~community/leave/constants/configs";
import {
  LeaveDurationTypes,
  LeaveTypeFormTypes,
  LeaveTypeModalEnums,
  LeaveTypeToastEnums
} from "~community/leave/enums/LeaveTypeEnums";
import { useLeaveStore } from "~community/leave/store/store";
import { LeaveTypeFormDataType } from "~community/leave/types/AddLeaveTypes";
import {
  carryForwardKeyDownRestriction,
  carryForwardPasteRestriction,
  getIsActiveFieldDirtyStatus,
  handleColorClick,
  handleLeaveDurationClick
} from "~community/leave/utils/leaveTypes/LeaveTypeUtils";
import { handleLeaveTypeApiResponse } from "~community/leave/utils/leaveTypes/apiUtils";
import { addLeaveTypeValidationSchema } from "~community/leave/utils/validations";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";

import { styles } from "./styles";

const LeaveTypeForm = () => {
  const translateText = useTranslator("leaveModule", "leaveTypes");

  const theme: Theme = useTheme();
  const classes = styles(theme);

  const router = useRouter();
  const { slug } = router.query;

  const { setToastMessage } = useToast();

  const {
    allLeaveTypes,
    editingLeaveType,
    setLeaveTypeFormDirty,
    setLeaveTypeModalType
  } = useLeaveStore((state) => ({
    allLeaveTypes: state.allLeaveTypes,
    editingLeaveType: state.editingLeaveType,
    setLeaveTypeFormDirty: state.setLeaveTypeFormDirty,
    setLeaveTypeModalType: state.setLeaveTypeModalType
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

  const [colors, setColors] = useState<string[]>(leaveTypeColors);
  const [selectedDate, setSelectedDate] = useState<DateTime | undefined>(
    undefined
  );

  const isOngoingSetupLeave = ongoingQuickSetup.SETUP_LEAVE_TYPES;

  const { data: leaveCycle } = useGetLeaveCycle();

  const { sendEvent } = useGoogleAnalyticsEvent();

  const { mutate: addLeaveType, isPending: isAddingLeaveTypePending } =
    useAddLeaveType(
      handleLeaveTypeApiResponse({
        type: LeaveTypeToastEnums.ADD_LEAVE_TYPE_SUCCESS,
        setToastMessage: setToastMessage,
        translateText: translateText,
        setFormDirty: setLeaveTypeFormDirty,
        redirect: router.push,
        stopAllOngoingQuickSetup,
        setQuickSetupModalType,
        isOngoingSetupLeave,
        sendEvent
      }),
      handleLeaveTypeApiResponse({
        type: LeaveTypeToastEnums.ADD_LEAVE_TYPE_ERROR,
        setToastMessage: setToastMessage,
        translateText: translateText
      })
    );

  const { mutate: editLeaveType, isPending: isEditingLeaveTypePending } =
    useEditLeaveType(
      handleLeaveTypeApiResponse({
        type: LeaveTypeToastEnums.EDIT_LEAVE_TYPE_SUCCESS,
        setToastMessage: setToastMessage,
        translateText: translateText,
        setFormDirty: setLeaveTypeFormDirty,
        redirect: router.push,
        sendEvent
      }),
      handleLeaveTypeApiResponse({
        type: LeaveTypeToastEnums.EDIT_LEAVE_TYPE_ERROR,
        setToastMessage: setToastMessage,
        translateText: translateText
      })
    );

  const initialValues: LeaveTypeFormDataType = useMemo(
    () => ({
      typeId: editingLeaveType?.typeId,
      name: editingLeaveType?.name,
      emoji: getEmoji(editingLeaveType?.emojiCode ?? ""),
      emojiCode: editingLeaveType?.emojiCode,
      colorCode: editingLeaveType?.colorCode,
      calculationType: editingLeaveType?.calculationType,
      leaveDuration: editingLeaveType?.leaveDuration ?? LeaveDurationTypes.NONE,
      maxCarryForwardDays:
        editingLeaveType?.maxCarryForwardDays === 0
          ? undefined
          : editingLeaveType?.maxCarryForwardDays,
      carryForwardExpirationDays: editingLeaveType?.carryForwardExpirationDays,
      carryForwardExpirationDate: editingLeaveType?.carryForwardExpirationDate,
      isAttachment: editingLeaveType?.isAttachment,
      isOverridden: editingLeaveType?.isOverridden,
      isAttachmentMandatory: editingLeaveType?.isAttachmentMandatory,
      isCommentMandatory: editingLeaveType?.isCommentMandatory,
      isAutoApproval: editingLeaveType?.isAutoApproval,
      isActive: editingLeaveType?.isActive,
      isCarryForwardEnabled: editingLeaveType?.isCarryForwardEnabled,
      isCarryForwardRemainingBalanceEnabled:
        editingLeaveType?.isCarryForwardRemainingBalanceEnabled
    }),
    [editingLeaveType]
  );

  const hasLeaveTypeStatusChanged = useMemo(() => {
    const result = getIsActiveFieldDirtyStatus(editingLeaveType, allLeaveTypes);
    return result;
  }, [allLeaveTypes, editingLeaveType]);

  const onSubmit = () => {
    const { typeId, emoji: _emoji, ...rest } = values;

    const payload = { ...rest, name: rest.name.trim() };

    if (slug === LeaveTypeFormTypes.ADD) {
      addLeaveType(payload);
    } else {
      if (hasLeaveTypeStatusChanged) {
        editingLeaveType.isActive
          ? setLeaveTypeModalType(LeaveTypeModalEnums.ACTIVATE_LEAVE_TYPE)
          : setLeaveTypeModalType(LeaveTypeModalEnums.INACTIVATE_LEAVE_TYPE);
      } else {
        editLeaveType({ leaveType: payload, id: typeId });
      }
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema: addLeaveTypeValidationSchema(
      allLeaveTypes,
      translateText
    ),
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit
  });

  const {
    values,
    errors,
    dirty,
    touched,
    setFieldValue,
    setFieldError,
    handleChange,
    handleSubmit
  } = formik;

  const isSaveBtnActive = useMemo(() => {
    if (slug === LeaveTypeFormTypes.EDIT) {
      return dirty || hasLeaveTypeStatusChanged;
    }

    return true;
  }, [dirty, hasLeaveTypeStatusChanged, slug]);

  useEffect(() => {
    setLeaveTypeFormDirty(dirty);
  }, [dirty]);

  useEffect(() => {
    if (values.carryForwardExpirationDate) {
      const carryForwardExpirationDateTime = DateTime.fromISO(
        values.carryForwardExpirationDate
      );
      setSelectedDate(carryForwardExpirationDateTime);
    }
  }, []);

  const handleCancelBtnClick = async () => {
    stopAllOngoingQuickSetup();
    await router.back();
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <Stack sx={classes.wrapper}>
          <Stack sx={classes.containerOne}>
            <InputField
              required={true}
              inputType="text"
              label={translateText(["name"])}
              inputName="name"
              error={errors?.name}
              value={values?.name}
              maxLength={characterLengths.LEAVE_TYPE_LENGTH}
              placeHolder={translateText(["leaveTypeNamePlaceholder"])}
              onChange={(event) => {
                setFieldValue(
                  "name",
                  event.target.value.replace(specialCharacters(), "")
                );
                setFieldError("name", "");
              }}
              inputStyle={{
                width: "100%"
              }}
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <EmojiPicker
                  label={translateText(["emoji"])}
                  inputName="emoji"
                  value={values?.emoji}
                  onChange={handleChange}
                  error={errors?.emoji}
                  formik={formik}
                  tooltip={translateText(["emojiTooltipText"])}
                  setUnicode={(value: string) =>
                    setFieldValue("emojiCode", value)
                  }
                  placeholder={translateText(["emojiPlaceholder"])}
                  required={true}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {colors ? (
                  <ColorPalette
                    label={translateText(["color"])}
                    colors={colors}
                    onClick={(color: string) =>
                      handleColorClick({
                        color,
                        colors,
                        setColors,
                        setFieldValue,
                        setFieldError
                      })
                    }
                    selectedColor={values?.colorCode}
                    error={errors?.colorCode}
                    required={true}
                  />
                ) : (
                  <ColorPaletteSkeleton label={translateText(["color"])} />
                )}
              </Grid>
            </Grid>
          </Stack>

          <Stack sx={classes.title}>
            <Typography
              variant="h4"
              sx={{
                color: errors.leaveDuration
                  ? theme.palette.error.contrastText
                  : theme.palette.common.black
              }}
            >
              {translateText(["leaveDurationPreferences"])}
              &nbsp;
              <Typography component="span" sx={classes.asterisk}>
                *
              </Typography>
            </Typography>
            <Tooltip
              id="leave-duration-preferences-section"
              title={translateText(["leaveDurationPreferencesTooltip"])}
              error={Boolean(errors.leaveDuration)}
              ariaLabel={translateText(["leaveDurationPreferencesTooltip"])}
            />
          </Stack>

          <Stack sx={classes.cardContainer}>
            <DescribedSelection
              title={translateText(["halfDay"])}
              description={translateText(["halfDayDescription"])}
              selected={
                values?.leaveDuration ===
                  LeaveDurationTypes.HALF_AND_FULL_DAY ||
                values?.leaveDuration === LeaveDurationTypes.HALF_DAY
              }
              onClick={() =>
                handleLeaveDurationClick(
                  values,
                  LeaveDurationTypes.HALF_DAY,
                  setFieldValue,
                  setFieldError
                )
              }
              isError={Boolean(errors.leaveDuration)}
              typographyStyles={{
                variant: {
                  title: "h4",
                  description: "body1"
                },
                color: {
                  title: theme.palette.common.black,
                  description: theme.palette.common.black
                }
              }}
            />
            <DescribedSelection
              title={translateText(["fullDay"])}
              description={translateText(["fullDayDescription"])}
              selected={
                values?.leaveDuration ===
                  LeaveDurationTypes.HALF_AND_FULL_DAY ||
                values?.leaveDuration === LeaveDurationTypes.FULL_DAY
              }
              onClick={() =>
                handleLeaveDurationClick(
                  values,
                  LeaveDurationTypes.FULL_DAY,
                  setFieldValue,
                  setFieldError
                )
              }
              isError={Boolean(errors.leaveDuration)}
              typographyStyles={{
                variant: {
                  title: "h4",
                  description: "body1"
                },
                color: {
                  title: theme.palette.common.black,
                  description: theme.palette.common.black
                }
              }}
            />
          </Stack>

          {errors.leaveDuration && touched.leaveDuration && (
            <Typography variant="body2" sx={classes.error}>
              {translateText(["durationError"])}
            </Typography>
          )}

          <Divider sx={classes.divider} />

          <Stack sx={classes.switchRowWrapper}>
            <Stack sx={classes.title}>
              <Typography variant="h4">
                {translateText(["leaveTypeSettings"])}
              </Typography>
              <Tooltip
                id="activate-leave-tooltip"
                title={translateText(["leaveTypeSettingsTooltip"])}
                ariaLabel={translateText(["leaveTypeSettingsTooltip"])}
              />
            </Stack>

            <SwitchRow
              labelId="enable-attachment"
              label={translateText(["enableAttachment"])}
              checked={values?.isAttachment}
              onChange={async (checked: boolean) => {
                await setFieldValue("isAttachment", checked);
                await setFieldValue(
                  "isAttachmentMandatory",
                  checked ? values?.isAttachmentMandatory : false
                );
              }}
            />

            <SwitchRow
              labelId="attachment-mandatory"
              label={translateText(["attachmentMandatory"])}
              checked={values?.isAttachmentMandatory}
              onChange={async (checked: boolean) =>
                await setFieldValue("isAttachmentMandatory", checked)
              }
              disabled={!values?.isAttachment}
            />

            <SwitchRow
              labelId="requires-comment"
              label={translateText(["requiresComment"])}
              checked={values?.isCommentMandatory}
              onChange={async (checked: boolean) => {
                await setFieldValue("isCommentMandatory", checked);
              }}
            />
          </Stack>

          <Divider sx={classes.divider} />

          <Stack sx={classes.switchRowWrapper}>
            <Typography variant="h4">
              {translateText(["leaveApprovalSettings"])}
            </Typography>

            <SwitchRow
              labelId="allow-auto-approval"
              label={translateText(["allowAutoApproval"])}
              checked={values?.isAutoApproval}
              onChange={async (checked: boolean) =>
                await setFieldValue("isAutoApproval", checked)
              }
            />
          </Stack>

          <Divider sx={classes.divider} />

          <Stack sx={classes.switchRowWrapper}>
            <Typography variant="h4">
              {translateText(["leaveCarryForward"])}
            </Typography>

            <SwitchRow
              labelId="enable-carry-forward"
              label={translateText(["enableCarryForward"])}
              checked={values?.isCarryForwardEnabled}
              onChange={async (checked: boolean) =>
                await setFieldValue("isCarryForwardEnabled", checked)
              }
            />

            <InputField
              maxLength={3}
              inputType="text"
              inputMode="numeric"
              onKeyDown={carryForwardKeyDownRestriction}
              onPaste={carryForwardPasteRestriction}
              label={translateText(["maximumCarryForwardDays"])}
              inputName="maxCarryForwardDays"
              error={errors?.maxCarryForwardDays}
              value={values?.maxCarryForwardDays}
              isDisabled={!values?.isCarryForwardEnabled}
              onChange={handleChange}
              placeHolder={translateText([
                "maximumCarryForwardDaysPlaceholder"
              ])}
              tooltip={translateText(["maximumCarryForwardDaysTooltip"])}
              tooltipStyles={classes.tooltip}
            />

            <InputDate
              isYearHidden
              name="carryForwardExpirationDate"
              label={translateText(["carryForwardExpirationDate"])}
              onchange={(value: string) => {
                setFieldValue(
                  "carryForwardExpirationDate",
                  value ? getLocalDate(new Date(value)) : ""
                );
                setFieldError("carryForwardExpirationDate", "");
              }}
              error={errors?.carryForwardExpirationDate}
              minDate={DateTime.fromObject({
                year: currentYear,
                month: leaveCycle?.startMonth,
                day: leaveCycle?.startDate
              })}
              maxDate={DateTime.fromObject({
                year: currentYear,
                month: leaveCycle?.endMonth,
                day: leaveCycle?.endDate
              })}
              placeholder={translateText([
                "carryForwardExpirationDatePlaceholder"
              ])}
              disabled={!values?.isCarryForwardEnabled}
              inputFormat={MONTH_DATE_FORMAT}
              tooltip={
                translateText(["carryForwardExpirationDateTooltip"]) ?? ""
              }
              tooltipStyles={classes.tooltip}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          </Stack>

          <Stack sx={classes.buttonWrapper}>
            <Button
              label={translateText(["cancelBtn"])}
              isFullWidth={false}
              endIcon={IconName.CLOSE_ICON}
              buttonStyle={ButtonStyle.TERTIARY}
              onClick={handleCancelBtnClick}
            />
            <Button
              shouldBlink={ongoingQuickSetup.SETUP_LEAVE_TYPES}
              type={ButtonTypes.SUBMIT}
              label={translateText(["saveBtn"])}
              isFullWidth={false}
              endIcon={IconName.RIGHT_ARROW_ICON}
              disabled={!isSaveBtnActive}
              isLoading={isAddingLeaveTypePending || isEditingLeaveTypePending}
            />
          </Stack>
        </Stack>
      </Form>
      <ConfirmLeaveTypeStatusUpdateModal
        values={values}
        mutate={editLeaveType}
      />
    </>
  );
};

export default LeaveTypeForm;
