import { Divider, Stack, Theme, Typography, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { AxiosError } from "axios";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import ColorPaletteSkeleton from "~community/common/components/atoms/ColorPaletteSkeleton/ColorPaletteSkeleton";
import DescribedSelection from "~community/common/components/atoms/DescribedSelection/DescribedSelection";
import Icon from "~community/common/components/atoms/Icon/Icon";
import SwitchRow from "~community/common/components/atoms/SwitchRow/SwitchRow";
import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import ColorPalette from "~community/common/components/molecules/ColorPalette/ColorPalette";
import EmojiPicker from "~community/common/components/molecules/EmojiPicker/EmojiPicker";
import Form from "~community/common/components/molecules/Form/Form";
import InputField from "~community/common/components/molecules/InputField/InputField";
import ROUTES from "~community/common/constants/routes";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { specialCharacters } from "~community/common/regex/regexPatterns";
import { IconName } from "~community/common/types/IconTypes";
import { getEmoji } from "~community/common/utils/commonUtil";
import {
  useAddPolicyLeaveType,
  useGetPolicyLeaveType,
  useUpdatePolicyLeaveType
} from "~community/leave/api/PolicyLeaveTypeApi";
import { leaveTypeColors } from "~community/leave/constants/configs";
import { MAX_POLICY_LEAVE_TYPE_NAME_LENGTH } from "~community/leave/constants/policyLeaveTypeConstants";
import {
  LeaveDurationTypes,
  LeaveTypeFormTypes
} from "~community/leave/enums/LeaveTypeEnums";
import { useLeaveStore } from "~community/leave/store/store";
import { PolicyLeaveTypeFormDataType } from "~community/leave/types/PolicyLeaveTypeTypes";
import { handleColorClick } from "~community/leave/utils/leaveTypes/LeaveTypeUtils";
import {
  getPolicyLeaveTypeErrorToastKeys,
  getUpdatedMinDuration,
  isMinDurationSelected,
  mapPolicyLeaveTypeFormToPayload
} from "~community/leave/utils/policyLeaveTypes/policyLeaveTypeUtils";
import { policyLeaveTypeValidationSchema } from "~community/leave/utils/validations";

import { styles } from "./styles";

const PolicyLeaveTypeForm = () => {
  const translateText = useTranslator("leaveModule", "leaveTypes");

  const theme: Theme = useTheme();
  const classes = styles(theme);

  const router = useRouter();
  const { slug, id } = router.query;

  const isEditMode = slug === LeaveTypeFormTypes.EDIT;
  const policyLeaveTypeId = id ? Number(id) : undefined;

  const { setToastMessage } = useToast();

  const { setLeaveTypeFormDirty } = useLeaveStore((state) => ({
    setLeaveTypeFormDirty: state.setLeaveTypeFormDirty
  }));

  const [colors, setColors] = useState<string[]>(leaveTypeColors);

  const { data: editingPolicyLeaveType, isLoading: isPolicyLeaveTypeLoading } =
    useGetPolicyLeaveType(isEditMode ? policyLeaveTypeId : undefined);

  const onMutationSuccess = async (isEdit: boolean) => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText([
        isEdit
          ? "editLeaveTypeSuccessToastTitle"
          : "addLeaveTypeSuccessToastTitle"
      ]),
      description: translateText([
        isEdit
          ? "editLeaveTypeSuccessToastDescription"
          : "addLeaveTypeSuccessToastDescription"
      ]),
      isIcon: true
    });
    setLeaveTypeFormDirty(false);
    await router.push(ROUTES.LEAVE.LEAVE_TYPES);
  };

  const onMutationError = (error: AxiosError) => {
    const { title, description } = getPolicyLeaveTypeErrorToastKeys(error);

    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText([title]),
      description: translateText([description]),
      isIcon: true
    });
  };

  const { mutate: addPolicyLeaveType, isPending: isAddPending } =
    useAddPolicyLeaveType(() => onMutationSuccess(false), onMutationError);

  const { mutate: updatePolicyLeaveType, isPending: isUpdatePending } =
    useUpdatePolicyLeaveType(() => onMutationSuccess(true), onMutationError);

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

  const onSubmit = (formValues: PolicyLeaveTypeFormDataType) => {
    const payload = mapPolicyLeaveTypeFormToPayload(formValues);

    if (isEditMode && policyLeaveTypeId) {
      updatePolicyLeaveType({ id: policyLeaveTypeId, payload });
      return;
    }

    addPolicyLeaveType(payload);
  };

  const formik = useFormik({
    initialValues,
    validationSchema: policyLeaveTypeValidationSchema(translateText),
    enableReinitialize: true,
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

  useEffect(() => {
    setLeaveTypeFormDirty(dirty);
  }, [dirty, setLeaveTypeFormDirty]);

  const handleMinDurationClick = async (duration: LeaveDurationTypes) => {
    await setFieldValue(
      "minDuration",
      getUpdatedMinDuration(values.minDuration, duration)
    );
    setFieldError("minDuration", "");
  };

  const handleCancelBtnClick = async () => {
    await router.push(ROUTES.LEAVE.LEAVE_TYPES);
  };

  const isSaveBtnDisabled = isEditMode ? !dirty : false;

  return (
    <Form onSubmit={handleSubmit}>
      <Stack sx={classes.wrapper}>
        <Stack sx={classes.containerOne}>
          <InputField
            required
            inputType="text"
            label={translateText(["name"])}
            inputName="name"
            error={errors?.name}
            value={values?.name}
            maxLength={MAX_POLICY_LEAVE_TYPE_NAME_LENGTH}
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
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              {isPolicyLeaveTypeLoading ? (
                <ColorPaletteSkeleton label={translateText(["color"])} />
              ) : (
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
                  required
                />
              )}
            </Grid>
          </Grid>
        </Stack>

        <Stack sx={classes.title}>
          <Typography
            variant="h4"
            sx={{
              color: errors.minDuration
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
            error={Boolean(errors.minDuration)}
            ariaLabel={translateText(["leaveDurationPreferencesTooltip"])}
          />
        </Stack>

        <Stack sx={classes.cardContainer}>
          <DescribedSelection
            title={translateText(["halfDay"])}
            description={translateText(["halfDayDescription"])}
            selected={isMinDurationSelected(
              values?.minDuration,
              LeaveDurationTypes.HALF_DAY
            )}
            onClick={() => handleMinDurationClick(LeaveDurationTypes.HALF_DAY)}
            isError={Boolean(errors.minDuration)}
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
            selected={isMinDurationSelected(
              values?.minDuration,
              LeaveDurationTypes.FULL_DAY
            )}
            onClick={() => handleMinDurationClick(LeaveDurationTypes.FULL_DAY)}
            isError={Boolean(errors.minDuration)}
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

        {errors.minDuration && touched.minDuration && (
          <Typography variant="body2" sx={classes.error}>
            {errors.minDuration}
          </Typography>
        )}

        <Divider sx={classes.divider} />

        <Stack sx={classes.switchRowWrapper}>
          <Stack sx={classes.title}>
            <Typography variant="h4">
              {translateText(["leaveTypeSettings"])}
            </Typography>
            <Tooltip
              id="leave-type-settings-tooltip"
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
                "isAttachmentMust",
                checked ? values?.isAttachmentMust : false
              );
            }}
          />

          <SwitchRow
            labelId="attachment-mandatory"
            label={translateText(["attachmentMandatory"])}
            checked={values?.isAttachmentMust}
            onChange={async (checked: boolean) =>
              await setFieldValue("isAttachmentMust", checked)
            }
            disabled={!values?.isAttachment}
          />

          <SwitchRow
            labelId="requires-comment"
            label={translateText(["requiresComment"])}
            checked={values?.isCommentMust}
            onChange={async (checked: boolean) =>
              await setFieldValue("isCommentMust", checked)
            }
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

        <Stack sx={classes.buttonWrapper}>
          <ButtonV2
            variant="tertiary"
            type="button"
            onClick={handleCancelBtnClick}
            icon={<Icon name={IconName.CLOSE_ICON} />}
            iconPosition="end"
          >
            {translateText(["cancelBtn"])}
          </ButtonV2>
          <ButtonV2
            variant="primary"
            type="submit"
            disabled={isSaveBtnDisabled}
            isLoading={isAddPending || isUpdatePending}
            icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
            iconPosition="end"
          >
            {translateText(["saveBtn"])}
          </ButtonV2>
        </Stack>
      </Stack>
    </Form>
  );
};

export default PolicyLeaveTypeForm;
