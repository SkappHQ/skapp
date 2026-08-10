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
  useCreateBusinessUnit,
  useGetBusinessUnits
} from "~community/common/api/BusinessUnitApi";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { businessUnitValidation } from "~community/configurations/utils/businessUnitValidations";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface BusinessUnitFormValues {
  name: string;
  description: string;
}

const AddBusinessUnitModal: FC<Props> = ({ isOpen, onClose }) => {
  const translateText = useTranslator("configurations", "businessUnit");
  const { setToastMessage } = useToast();

  const { data: businessUnits } = useGetBusinessUnits();

  const handleCreateSuccess = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["toasts", "createSuccess", "title"]),
      description: translateText(["toasts", "createSuccess", "description"], {
        name: formik.values.name.trim()
      })
    });
    formik.resetForm();
    onClose();
  };

  const handleCreateError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toasts", "error", "title"]),
      description: translateText(["toasts", "error", "description"])
    });
  };

  const { mutate: createBusinessUnit, isPending } = useCreateBusinessUnit(
    handleCreateSuccess,
    handleCreateError
  );

  const handleSubmit = (values: BusinessUnitFormValues) => {
    createBusinessUnit({
      name: values.name.trim(),
      description: values.description.trim()
    });
  };

  const formik = useFormik<BusinessUnitFormValues>({
    initialValues: { name: "", description: "" },
    validationSchema: businessUnitValidation(translateText, businessUnits),
    validateOnChange: false,
    validateOnBlur: false,
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
      modalHeader={translateText(["form", "addModalTitle"])}
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

export default AddBusinessUnitModal;
