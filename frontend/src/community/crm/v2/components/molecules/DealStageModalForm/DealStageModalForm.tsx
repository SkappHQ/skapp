import {
  ButtonV2,
  CloseIcon,
  ColorSelector,
  InputField,
  TextArea
} from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  useCreateDealStage,
  useUpdateDealStage
} from "~community/crm/v2/api/DealApi";
import { DEAL_STAGE_COLORS } from "~community/crm/v2/constants/stageConstants";
import { CrmDealStageColorsEnum } from "~community/crm/v2/enums/common";
import useStageNameMapper from "~community/crm/v2/hooks/useStageNameMapper";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmStageEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { getOrderedStages } from "~community/crm/v2/utils/commonUtil";
import {
  getChangedStageFields,
  getSelectedStage,
  updateStage
} from "~community/crm/v2/utils/stageUtil";
import { getStageValidationSchema } from "~community/crm/v2/utils/stageValidations";

interface DealStageModalFormProps {
  isEdit?: boolean;
  onStageCreated?: () => void;
}

const DealStageModalForm: FC<DealStageModalFormProps> = ({
  isEdit = false,
  onStageCreated
}) => {
  const { setToastMessage } = useToast();
  const translateText = useTranslator("configurations", "crm");
  const { getStageDisplayName } = useStageNameMapper();

  const { stages, setStages, setIsDealStageModalOpen, selectedDealStageId } =
    useCrmStoreV2(
      useShallow((store) => ({
        stages: store.stages,
        setStages: store.setStages,
        setIsDealStageModalOpen: store.setIsDealStageModalOpen,
        selectedDealStageId: store.selectedDealStageId
      }))
    );

  const orderedStages = getOrderedStages(stages);

  const selectedDealStage = getSelectedStage(stages, selectedDealStageId);

  const initialValues: CrmStageEntity = {
    name: isEdit ? (getStageDisplayName(selectedDealStage?.name) ?? "") : "",
    description: isEdit ? (selectedDealStage?.description ?? "") : "",
    color: selectedDealStage?.color ?? CrmDealStageColorsEnum.SKY
  };

  const handleCreateSuccess = () => {
    onStageCreated?.();
    handleSuccess();
  };

  const handleEditSuccess = (updatedStage: CrmStageEntity) => {
    if (updatedStage.id !== undefined) {
      setStages(updateStage(stages, updatedStage.id, updatedStage));
    }
    handleSuccess();
  };

  const handleSuccess = () => {
    setSubmitting(false);
    handleCloseModal();

    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText([
        isEdit ? "editDealStageModal" : "addDealStageModal",
        "toastMessages",
        "successTitle"
      ]),
      description: translateText([
        isEdit ? "editDealStageModal" : "addDealStageModal",
        "toastMessages",
        "successDescription"
      ])
    });
  };

  const handleError = () => {
    setSubmitting(false);

    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText([
        isEdit ? "editDealStageModal" : "addDealStageModal",
        "toastMessages",
        "errorTitle"
      ]),
      description: translateText([
        isEdit ? "editDealStageModal" : "addDealStageModal",
        "toastMessages",
        "errorDescription"
      ])
    });
  };

  const handleCloseModal = (): void => {
    setIsDealStageModalOpen(false);
  };

  const { mutate: createDealStage, isPending: isCreatePending } =
    useCreateDealStage(handleCreateSuccess, handleError);

  const { mutate: updateDealStage, isPending: isUpdatePending } =
    useUpdateDealStage(handleEditSuccess, handleError);

  const handleEdit = (values: CrmStageEntity) => {
    const changedFields = getChangedStageFields(initialValues, values);
    if (
      Object.keys(changedFields).length === 0 ||
      selectedDealStage?.id === undefined
    ) {
      handleCloseModal();
      return;
    }

    updateDealStage({ id: selectedDealStage.id, ...changedFields });
  };

  const handleCreate = (values: CrmStageEntity) => {
    createDealStage({
      name: values.name?.trim(),
      description: values.description?.trim(),
      color: values.color
    });
  };

  const formik = useFormik({
    initialValues,
    onSubmit: isEdit ? handleEdit : handleCreate,
    validationSchema: getStageValidationSchema(
      translateText,
      orderedStages,
      selectedDealStage?.id
    ),
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true
  });

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    setSubmitting,
    setFieldValue,
    submitForm
  } = formik;

  const isPending = isCreatePending || isUpdatePending;

  return (
    <div className="flex flex-col h-full justify-between gap-[0.625rem]">
      <InputField
        id="status-name-input-field"
        name="name"
        label={translateText(["dealStageModal", "nameInputLabel"])}
        value={values.name}
        state={errors?.name ? "error" : "default"}
        errorMessage={errors?.name}
        className="w-full"
        onChange={handleChange}
        onBlur={handleBlur}
        required
      />

      <TextArea
        id="status-description-textarea"
        name="description"
        label={translateText(["dealStageModal", "descriptionInputLabel"])}
        value={values.description}
        state={errors?.description ? "error" : "default"}
        errorMessage={errors?.description}
        onChange={handleChange}
        onBlur={handleBlur}
      />

      <ColorSelector
        id="status-color-selector"
        label={translateText(["dealStageModal", "colorInputLabel"])}
        selectedColorId={values.color}
        onColorChange={(color) => setFieldValue("color", color.value)}
        colors={DEAL_STAGE_COLORS}
      />

      <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
        <ButtonV2
          variant="tertiary"
          type="button"
          disabled={isPending}
          onClick={handleCloseModal}
          icon={<CloseIcon />}
          iconPosition="end"
        >
          {translateText(["dealStageModal", "buttons", "cancel"])}
        </ButtonV2>

        <ButtonV2
          variant="primary"
          type="button"
          onClick={submitForm}
          disabled={isPending}
          isLoading={isPending}
        >
          {translateText(["dealStageModal", "buttons", "save"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default DealStageModalForm;
