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
import { useConfigurationStore } from "~community/configurations/stores/configurationStore";
import {
  useCreateDealStage,
  useDealStageById,
  useUpdateDealStage
} from "~community/crm/api/crmDealApi";
import { CrmDealStageColorsEnum } from "~community/crm/enums/common";
import useGetMappedDealStages from "~community/crm/hooks/useGetMappedDealStages";
import useStageNameMapper from "~community/crm/hooks/useStageNameMapper";
import {
  CrmDealStageCreatePayload,
  CrmDealStageFormTypes,
  CrmDealStageUpdatePayload
} from "~community/crm/types/CommonTypes";
import {
  dealStageColors,
  getChangedDealStageFields
} from "~community/crm/utils/crmUtil";
import { dealStageValidations } from "~community/crm/utils/dealStageValidations";

interface DealStageModalFormProps {
  isEdit?: boolean;
}

const DealStageModalForm: FC<DealStageModalFormProps> = ({
  isEdit = false
}) => {
  const { setToastMessage } = useToast();
  const { getStageByName } = useStageNameMapper();
  const { dealStages } = useGetMappedDealStages();
  const translateText = useTranslator("configurations", "crm");

  const { setIsDealStageModalOpen, selectedDealStageId } =
    useConfigurationStore(
      useShallow((store) => ({
        setIsDealStageModalOpen: store.setIsDealStageModalOpen,
        selectedDealStageId: store.selectedDealStageId
      }))
    );

  const selectedDealStage = useDealStageById(selectedDealStageId!);

  const initialValues: CrmDealStageFormTypes = {
    name: isEdit ? getStageByName(selectedDealStage!.name) : "",
    description: isEdit ? (selectedDealStage?.description ?? "") : "",
    color: isEdit ? selectedDealStage!.color : CrmDealStageColorsEnum.SKY
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
    useCreateDealStage(handleSuccess, handleError);

  const { mutate: updateDealStage, isPending: isUpdatePending } =
    useUpdateDealStage(handleSuccess, handleError);

  const handleEdit = (values: CrmDealStageFormTypes) => {
    const changedFields = getChangedDealStageFields(values, initialValues);
    if (Object.keys(changedFields).length === 0) {
      handleCloseModal();
      return;
    }

    const payload: CrmDealStageUpdatePayload = {
      id: selectedDealStage!.id,
      ...changedFields
    };
    updateDealStage(payload);
  };

  const handleCreate = (values: CrmDealStageFormTypes) => {
    const payload: CrmDealStageCreatePayload = {
      name: values.name.trim(),
      description: values.description.trim() || null,
      color: values.color
    };
    createDealStage(payload);
  };

  const formik = useFormik({
    initialValues,
    onSubmit: isEdit ? handleEdit : handleCreate,
    validationSchema: dealStageValidations(
      translateText,
      dealStages,
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
        colors={dealStageColors}
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
