import {
  CloseIcon,
  InputField,
  SaveIcon,
  SmallModal,
  TextArea
} from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { FC } from "react";

import {
  useGetBusinessUnits,
  useUpdateBusinessUnit
} from "~community/common/api/BusinessUnitApi";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  BusinessUnit,
  BusinessUnitFormValues
} from "~community/common/types/BusinessUnitTypes";
import { businessUnitValidation } from "~community/configurations/utils/businessUnitValidations";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  businessUnit: BusinessUnit;
}

const EditBusinessUnitModal: FC<Props> = ({
  isOpen,
  onClose,
  businessUnit
}) => {
  const translateText = useTranslator("configurations", "businessUnit");
  const { setToastMessage } = useToast();

  const { data: businessUnits } = useGetBusinessUnits();

  const handleUpdateSuccess = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["toasts", "updateSuccess", "title"]),
      description: translateText(["toasts", "updateSuccess", "description"], {
        name: formik.values.name.trim()
      })
    });
    formik.resetForm();
    onClose();
  };

  const handleUpdateError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toasts", "error", "title"]),
      description: translateText(["toasts", "error", "description"])
    });
  };

  const { mutate: updateBusinessUnit, isPending } = useUpdateBusinessUnit(
    handleUpdateSuccess,
    handleUpdateError
  );

  const handleSubmit = (values: BusinessUnitFormValues) => {
    const name = values.name.trim();
    const description = values.description.trim();

    const isUnchanged =
      name === businessUnit.name.trim() &&
      description === (businessUnit.description ?? "").trim();
    if (isUnchanged) {
      onClose();
      return;
    }

    updateBusinessUnit({
      id: businessUnit.businessUnitId,
      payload: { name, description }
    });
  };

  const initialValues: BusinessUnitFormValues = {
    name: businessUnit.name,
    description: businessUnit.description ?? ""
  };

  const formik = useFormik<BusinessUnitFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: businessUnitValidation(
      translateText,
      businessUnits,
      businessUnit.businessUnitId
    ),
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: handleSubmit
  });

  const handleClose = () => {
    if (isPending) return;
    formik.resetForm();
    onClose();
  };

  return (
    <SmallModal
      isOpen={isOpen}
      onClose={handleClose}
      modalHeader={translateText(["form", "editModalTitle"])}
      content={
        <div className="flex flex-col gap-4">
          <InputField
            label={translateText(["form", "nameLabel"])}
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder={translateText(["form", "namePlaceholder"])}
            errorMessage={formik.errors.name}
            state={formik.errors.name ? "error" : "default"}
            autoFocus
            fullWidth
            required
          />
          <TextArea
            label={translateText(["form", "descriptionLabel"])}
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder={translateText(["form", "descriptionPlaceholder"])}
            errorMessage={formik.errors.description}
            state={formik.errors.description ? "error" : "default"}
          />
        </div>
      }
      buttons={{
        buttonLeft: {
          variant: "tertiary",
          onClick: handleClose,
          icon: <CloseIcon />,
          iconPosition: "end",
          disabled: isPending,
          children: translateText(["form", "cancelButton"])
        },
        buttonRight: {
          variant: "primary",
          onClick: () => formik.handleSubmit(),
          icon: <SaveIcon />,
          iconPosition: "end",
          disabled: isPending,
          isLoading: isPending,
          children: translateText(["form", "saveButton"])
        }
      }}
    />
  );
};

export default EditBusinessUnitModal;
