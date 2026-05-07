import { Stack } from "@mui/material";
import {
  ButtonV2,
  CloseIcon,
  EastArrowIcon
} from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { ChangeEvent, useState } from "react";
import * as Yup from "yup";

import InputField from "~community/common/components/molecules/InputField/InputField";
import { useTranslator } from "~community/common/hooks/useTranslator";
import CompanySearchField from "~community/crm/components/molecules/CompanySearchField/CompanySearchField";
import OwnerSearchField from "~community/crm/components/molecules/OwnerSearchField/OwnerSearchField";
import { useCrmStore } from "~community/crm/store/crmStore";
import { CrmOwnerType } from "~community/crm/types/CrmContactTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

interface CreateContactFormValues {
  name: string;
  email: string;
  company: string;
  contactNumber: string;
  ownerId: number | null;
}

const MOCK_OWNERS: CrmOwnerType[] = [
  { employeeId: 1, firstName: "Alice", lastName: "Johnson", authPic: null },
  { employeeId: 2, firstName: "Bob", lastName: "Smith", authPic: null },
  { employeeId: 3, firstName: "Carol", lastName: "Williams", authPic: null },
  { employeeId: 4, firstName: "David", lastName: "Brown", authPic: null }
];

const MOCK_COMPANIES = [
  "Acme Corp",
  "Globex Corporation",
  "Initech",
  "Umbrella Corp",
  "Wayne Enterprises"
];

const CreateContactModal = () => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "createContactModal"
  );

  const { setIsAddContactModalOpen, setCrmModalType } = useCrmStore((state) => state);

  const [selectedOwner, setSelectedOwner] = useState<CrmOwnerType | null>(null);

  const validationSchema = Yup.object({
    name: Yup.string().required(translateText(["contactNameRequired"])),
    email: Yup.string()
      .required(translateText(["emailRequired"]))
      .email(translateText(["emailInvalid"]))
  });

  const formik = useFormik<CreateContactFormValues>({
    initialValues: {
      name: "",
      email: "",
      company: "",
      contactNumber: "",
      ownerId: null
    },
    validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: (_values) => {
      setIsAddContactModalOpen(false);
      setCrmModalType(CrmModalTypes.NONE);
    }
  });

  const { values, errors, setFieldValue, setFieldError, handleSubmit } = formik;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFieldValue(name, value);
    setFieldError(name, "");
  };

  const handleOwnerSelect = (owner: CrmOwnerType) => {
    setSelectedOwner(owner);
    setFieldValue("ownerId", owner.employeeId);
  };

  const handleOwnerClear = () => {
    setSelectedOwner(null);
    setFieldValue("ownerId", null);
  };

  return (
    <Stack gap={2}>
      <InputField
        inputName="name"
        label={translateText(["contactName"])}
        placeHolder={translateText(["enterContactName"])}
        value={values.name}
        error={errors.name}
        required
        onChange={handleChange}
        labelStyles={{ fontWeight: 500 }}
      />

      <InputField
        inputName="email"
        inputType="email"
        label={translateText(["email"])}
        placeHolder={translateText(["enterEmail"])}
        value={values.email}
        error={errors.email}
        required
        onChange={handleChange}
        labelStyles={{ fontWeight: 500 }}
      />

      <CompanySearchField
        label={translateText(["company"])}
        placeholder={translateText(["enterCompany"])}
        value={values.company}
        onChange={(v) => setFieldValue("company", v)}
        options={MOCK_COMPANIES}
        onAddCompany={() => {}}
        addCompanyLabel={translateText(["addCompany"])}
        noResultsText={translateText(["noCompanyFound"])}
      />

      <InputField
        inputName="contactNumber"
        label={translateText(["contactNo"])}
        placeHolder={translateText(["enterContactNo"])}
        value={values.contactNumber}
        onChange={handleChange}
        labelStyles={{ fontWeight: 500 }}
      />

      <OwnerSearchField
        label={translateText(["contactOwner"])}
        placeholder={translateText(["searchOwner"])}
        selectedOwner={selectedOwner}
        onSelect={handleOwnerSelect}
        onClear={handleOwnerClear}
        options={MOCK_OWNERS}
        noResultsText={translateText(["noOwnerFound"])}
      />

      <Stack direction="row" justifyContent="flex-end" gap={1.5} mt={2}>
        <ButtonV2
          variant="tertiary"
          icon={<CloseIcon />}
          iconPosition="end"
          onClick={() => { setIsAddContactModalOpen(false); setCrmModalType(CrmModalTypes.NONE); }}
        >
          {translateText(["cancel"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          icon={<EastArrowIcon />}
          iconPosition="end"
          onClick={() => handleSubmit()}
        >
          {translateText(["save"])}
        </ButtonV2>
      </Stack>
    </Stack>
  );
};

export default CreateContactModal;
