import {
  ArrowRightIcon,
  ButtonV2,
  CloseIcon,
  InfoIcon,
  InputField,
  Tooltip
} from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { ChangeEvent, FC, useEffect, useMemo, useRef } from "react";

import ColorPaletteSkeleton from "~community/common/components/atoms/ColorPaletteSkeleton/ColorPaletteSkeleton";
import ColorPalette from "~community/common/components/molecules/ColorPalette/ColorPalette";
import EmojiPicker from "~community/common/components/molecules/EmojiPicker/EmojiPicker";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { specialCharacters } from "~community/common/regex/regexPatterns";
import { getBlinkClass, getEmoji } from "~community/common/utils/commonUtil";
import { useGetPolicyLeaveType } from "~community/leave/api/PolicyLeaveTypeApi";
import { leaveTypeColors } from "~community/leave/constants/configs";
import {
  MAX_POLICY_LEAVE_TYPE_NAME_LENGTH,
  MIN_DURATION_ERROR_ID,
  MIN_DURATION_GROUP_LABEL_ID
} from "~community/leave/constants/policyLeaveTypeConstants";
import {
  LeaveDurationTypes,
  LeaveTypeFormTypes
} from "~community/leave/enums/LeaveTypeEnums";
import usePolicyLeaveTypeFormSubmit from "~community/leave/hooks/usePolicyLeaveTypeFormSubmit";
import { useLeaveStore } from "~community/leave/store/store";
import { PolicyLeaveTypeFormDataType } from "~community/leave/types/PolicyLeaveTypeTypes";
import {
  getUpdatedMinDuration,
  isMinDurationSelected
} from "~community/leave/utils/policyLeaveTypes/policyLeaveTypeUtils";
import { policyLeaveTypeValidationSchema } from "~community/leave/utils/validations";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";

import DurationOptionCard from "./DurationOptionCard";
import SettingToggleRow from "./SettingToggleRow";

const PolicyLeaveTypeForm: FC = () => {
  const translateText = useTranslator("leaveModule", "leaveTypes");

  const router = useRouter();
  const { slug, id } = router.query;

  const isEditMode = slug === LeaveTypeFormTypes.EDIT;
  const policyLeaveTypeId = Number(id);

  const isMissingEditId = isEditMode && router.isReady && !policyLeaveTypeId;

  const { setLeaveTypeFormDirty } = useLeaveStore((state) => ({
    setLeaveTypeFormDirty: state.setLeaveTypeFormDirty
  }));

  const { ongoingQuickSetup } = useCommonEnterpriseStore((state) => ({
    ongoingQuickSetup: state.ongoingQuickSetup
  }));

  const durationGroupRef = useRef<HTMLDivElement>(null);

  const { data: editingPolicyLeaveType, isLoading: isPolicyLeaveTypeLoading } =
    useGetPolicyLeaveType(policyLeaveTypeId, isEditMode);

  const { submitPolicyLeaveType, isSubmitting } = usePolicyLeaveTypeFormSubmit({
    isEditMode,
    policyLeaveTypeId
  });

  const initialValues: PolicyLeaveTypeFormDataType = useMemo(
    () => ({
      name: editingPolicyLeaveType?.name ?? "",
      emoji: getEmoji(editingPolicyLeaveType?.emojiCode ?? ""),
      emojiCode: editingPolicyLeaveType?.emojiCode ?? "",
      colorCode: editingPolicyLeaveType?.colorCode ?? leaveTypeColors[0],
      minDuration:
        editingPolicyLeaveType?.minDuration ?? LeaveDurationTypes.NONE,
      isAttachment: editingPolicyLeaveType?.isAttachment ?? false,
      isAttachmentMust: editingPolicyLeaveType?.isAttachmentMust ?? false,
      isCommentMust: editingPolicyLeaveType?.isCommentMust ?? false,
      isAutoApproval: editingPolicyLeaveType?.isAutoApproval ?? false
    }),
    [editingPolicyLeaveType]
  );

  const formik = useFormik({
    initialValues,
    validationSchema: policyLeaveTypeValidationSchema(translateText),
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: submitPolicyLeaveType
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

  useEffect(() => {
    setLeaveTypeFormDirty(dirty);
  }, [dirty, setLeaveTypeFormDirty]);

  useEffect(() => {
    if (isMissingEditId) {
      router.replace(ROUTES.LEAVE.LEAVE_TYPES);
    }
  }, [isMissingEditId, router]);

  const handleMinDurationClick = async (duration: LeaveDurationTypes) => {
    await setFieldValue(
      "minDuration",
      getUpdatedMinDuration(values.minDuration, duration)
    );
    setFieldError("minDuration", "");
  };

  const handleDurationNavigate = (
    fromIndex: number,
    direction: number
  ): void => {
    const options = durationGroupRef.current?.querySelectorAll<HTMLElement>(
      ':scope > [role="checkbox"]'
    );

    if (!options?.length) {
      return;
    }

    const nextIndex = (fromIndex + direction + options.length) % options.length;

    options[nextIndex]?.focus();
  };

  const handleNameChange = async (event: ChangeEvent<HTMLInputElement>) => {
    await setFieldValue(
      "name",
      event.target.value.replace(specialCharacters(), "")
    );
    setFieldError("name", "");
  };

  const handleColorSelect = async (color: string) => {
    await setFieldValue("colorCode", color);
    setFieldError("colorCode", "");
  };

  const handleAttachmentToggle = async (checked: boolean) => {
    await setFieldValue("isAttachment", checked);
    await setFieldValue(
      "isAttachmentMust",
      checked ? values?.isAttachmentMust : false
    );
  };

  const handleAttachmentMustToggle = async (checked: boolean) => {
    await setFieldValue("isAttachmentMust", checked);
  };

  const handleCommentMustToggle = async (checked: boolean) => {
    await setFieldValue("isCommentMust", checked);
  };

  const handleAutoApprovalToggle = async (checked: boolean) => {
    await setFieldValue("isAutoApproval", checked);
  };

  const handleEmojiChange = (value: string): void => {
    setFieldValue("emojiCode", value);
  };

  const handleCancelBtnClick = async () => {
    await router.push(ROUTES.LEAVE.LEAVE_TYPES);
  };

  const isSaveBtnDisabled = isEditMode ? !dirty : false;
  const hasMinDurationError = Boolean(errors.minDuration);

  if (isMissingEditId) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} autoComplete="off">
      <div className="flex w-full max-w-146.5 flex-col">
        <div className="flex flex-col gap-4 pb-10">
          <InputField
            label={translateText(["name"])}
            name="name"
            type="text"
            required
            value={values?.name}
            maxLength={MAX_POLICY_LEAVE_TYPE_NAME_LENGTH}
            placeholder={translateText(["leaveTypeNamePlaceholder"])}
            state={errors?.name ? "error" : "default"}
            errorMessage={errors?.name}
            onChange={handleNameChange}
            fullWidth
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <EmojiPicker
              label={translateText(["emoji"])}
              inputName="emoji"
              value={values?.emoji}
              onChange={handleChange}
              error={errors?.emoji}
              formik={formik}
              tooltip={translateText(["emojiTooltipText"])}
              setUnicode={handleEmojiChange}
              placeholder={translateText(["emojiPlaceholder"])}
              required
            />
            {isPolicyLeaveTypeLoading ? (
              <ColorPaletteSkeleton label={translateText(["color"])} />
            ) : (
              <ColorPalette
                label={translateText(["color"])}
                colors={leaveTypeColors}
                onClick={handleColorSelect}
                selectedColor={values?.colorCode}
                error={errors?.colorCode}
                required
              />
            )}
          </div>
        </div>

        <div className="flex flex-row items-center gap-4">
          <h3
            id={MIN_DURATION_GROUP_LABEL_ID}
            className={`subtitle2 ${
              hasMinDurationError ? "text-semantic-red-text" : "text-black"
            }`}
          >
            {translateText(["leaveDurationPreferences"])}
            &nbsp;
            <span className="text-semantic-red-text">*</span>
          </h3>
          <Tooltip
            id="leave-duration-preferences-section"
            content={translateText(["leaveDurationPreferencesTooltip"])}
          >
            <InfoIcon className="size-4 text-secondary-icon" />
          </Tooltip>
        </div>

        <div
          ref={durationGroupRef}
          role="group"
          aria-labelledby={MIN_DURATION_GROUP_LABEL_ID}
          className="mt-4 flex flex-col gap-5"
        >
          <DurationOptionCard
            title={translateText(["halfDay"])}
            description={translateText(["halfDayDescription"])}
            isSelected={isMinDurationSelected(
              values?.minDuration,
              LeaveDurationTypes.HALF_DAY
            )}
            isError={hasMinDurationError}
            index={0}
            describedBy={
              hasMinDurationError ? MIN_DURATION_ERROR_ID : undefined
            }
            onSelect={() => handleMinDurationClick(LeaveDurationTypes.HALF_DAY)}
            onNavigate={handleDurationNavigate}
          />
          <DurationOptionCard
            title={translateText(["fullDay"])}
            description={translateText(["fullDayDescription"])}
            isSelected={isMinDurationSelected(
              values?.minDuration,
              LeaveDurationTypes.FULL_DAY
            )}
            isError={hasMinDurationError}
            index={1}
            describedBy={
              hasMinDurationError ? MIN_DURATION_ERROR_ID : undefined
            }
            onSelect={() => handleMinDurationClick(LeaveDurationTypes.FULL_DAY)}
            onNavigate={handleDurationNavigate}
          />
        </div>

        {errors.minDuration && touched.minDuration && (
          <p
            id={MIN_DURATION_ERROR_ID}
            role="alert"
            className="body2 mt-1.5 text-semantic-red-text"
          >
            {errors.minDuration}
          </p>
        )}

        <hr className="my-6 border-secondary-accent" />

        <div className="flex flex-col gap-6">
          <div className="flex flex-row items-center gap-4">
            <h3 className="subtitle2 text-black">
              {translateText(["leaveTypeSettings"])}
            </h3>
            <Tooltip
              id="leave-type-settings-tooltip"
              content={translateText(["leaveTypeSettingsTooltip"])}
            >
              <InfoIcon className="size-4 text-secondary-icon" />
            </Tooltip>
          </div>

          <SettingToggleRow
            label={translateText(["enableAttachment"])}
            checked={values?.isAttachment}
            onChange={handleAttachmentToggle}
          />

          <SettingToggleRow
            label={translateText(["attachmentMandatory"])}
            checked={values?.isAttachmentMust}
            onChange={handleAttachmentMustToggle}
            disabled={!values?.isAttachment}
          />

          <SettingToggleRow
            label={translateText(["requiresComment"])}
            checked={values?.isCommentMust}
            onChange={handleCommentMustToggle}
          />
        </div>

        <hr className="my-6 border-secondary-accent" />

        <div className="flex flex-col gap-6">
          <h3 className="subtitle2 text-black">
            {translateText(["leaveApprovalSettings"])}
          </h3>

          <SettingToggleRow
            label={translateText(["allowAutoApproval"])}
            checked={values?.isAutoApproval}
            onChange={handleAutoApprovalToggle}
          />
        </div>

        <div className="my-8 flex flex-col-reverse gap-3 sm:flex-row">
          <ButtonV2
            variant="tertiary"
            type="button"
            onClick={handleCancelBtnClick}
            icon={<CloseIcon />}
            iconPosition="end"
          >
            {translateText(["cancelBtn"])}
          </ButtonV2>
          <ButtonV2
            variant="primary"
            type="submit"
            disabled={isSaveBtnDisabled}
            isLoading={isSubmitting}
            icon={<ArrowRightIcon />}
            iconPosition="end"
            className={getBlinkClass(ongoingQuickSetup.SETUP_LEAVE_TYPES)}
          >
            {translateText(["saveBtn"])}
          </ButtonV2>
        </div>
      </div>
    </form>
  );
};

export default PolicyLeaveTypeForm;
