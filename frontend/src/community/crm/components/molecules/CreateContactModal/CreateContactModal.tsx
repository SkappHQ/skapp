import {
  ButtonV2,
  CloseIcon,
  EastArrowIcon,
  InputField
} from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import * as Yup from "yup";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import useSessionData from "~community/common/hooks/useSessionData";
import { useToast } from "~community/common/providers/ToastProvider";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";
import useGetDefaultCountryCode from "~community/people/hooks/useGetDefaultCountryCode";
import {
  useCreateContact,
  useGetCrmCompanies,
  useGetCrmOwners
} from "~community/crm/api/CrmContactsApi";
import CompanySearchField from "~community/crm/components/molecules/CompanySearchField/CompanySearchField";
import OwnerSearchField from "~community/crm/components/molecules/OwnerSearchField/OwnerSearchField";
import { useCrmStore } from "~community/crm/store/store";
import { ContactOwner } from "~community/crm/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

interface CreateContactFormValues {
  name: string;
  email: string;
  company: string;
  companyId: number | null;
  contactNumber: string;
  countryCode: string;
  ownerId: number | null;
}

const CreateContactModal = () => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "createContactModal"
  );
  const countryCode = useGetDefaultCountryCode();
  const { setToastMessage } = useToast();

  const { setIsAddContactModalOpen, setCrmModalType } = useCrmStore((state) => state);

  const { isCrmAdmin, isCrmSalesManager, isCrmSalesRepresentative, isSuperAdmin } = useSessionData();
  const { data: me } = useGetUserPersonalDetails();

  const crmRole = useMemo((): ContactOwner["crmRole"] => {
    if (isCrmAdmin) return "CRM_ADMIN";
    if (isCrmSalesManager) return "CRM_SALES_MANAGER";
    return "CRM_SALES_REPRESENTATIVE";
  }, [isCrmAdmin, isCrmSalesManager]);

  const defaultOwner = useMemo((): ContactOwner | null => {
    if (!me?.employeeId) return null;
    return {
      employeeId: me.employeeId as number,
      firstName: me.firstName ?? "",
      lastName: me.lastName ?? "",
      email: me.email ?? "",
      authPic: (me.authPic as string | null) ?? null,
      crmRole
    };
  }, [me, crmRole]);

  const [selectedOwner, setSelectedOwner] = useState<ContactOwner | null>(null);

  const { data: companiesData }= useGetCrmCompanies({ page: 0, size: 100 });
  const { data: ownersData } = useGetCrmOwners({ page: 0, size: 100 });

  const companyOptions = (companiesData?.items ?? []).map((c) => ({
    id: c.id,
    name: c.name
  }));

  const ownerOptions: ContactOwner[] = (ownersData?.items ?? []).map((o) => ({
    employeeId: o.employeeId,
    firstName: o.firstName,
    lastName: o.lastName,
    email: o.email,
    authPic: o.authPic,
    crmRole: o.crmRole
  }));

  const validationSchema = Yup.object({
    name: Yup.string().required(translateText(["contactNameRequired"])),
    email: Yup.string()
      .required(translateText(["emailRequired"]))
      .email(translateText(["emailInvalid"]))
  });

  const { mutate, isPending } = useCreateContact({
    onSuccess: () => {
      setIsAddContactModalOpen(false);
      setCrmModalType(CrmModalTypes.ADD_CONTACT_MODAL);
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["createContactSuccessTitle"]),
        description: translateText(["createContactSuccess"])
      });
    },
    onError: (message: string) => {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["createContactErrorTitle"]),
        description: message
      });
    }
  });

  const formik = useFormik<CreateContactFormValues>({
    initialValues: {
      name: "",
      email: "",
      company: "",
      companyId: null,
      contactNumber: "",
      countryCode,
      ownerId: defaultOwner?.employeeId ?? null
    },
    validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: (values) => {
      mutate({
        name: values.name,
        email: values.email,
        companyId: values.companyId || undefined,
        contactNumber:
          values.contactNumber
            ? `+${values.countryCode}${values.contactNumber}`
            : undefined,
        ownerId: values.ownerId || undefined
      });
    }
  });

  useEffect(() => {
    if (defaultOwner && !selectedOwner) {
      setSelectedOwner(defaultOwner);
      formik.setFieldValue("ownerId", defaultOwner.employeeId);
    }
  }, [defaultOwner]);

  const { values, errors, setFieldValue, setFieldError, handleSubmit } = formik;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFieldValue(name, value);
    setFieldError(name, "");
  };

  const handleOwnerSelect = (owner: ContactOwner) => {
    setSelectedOwner(owner);
    setFieldValue("ownerId", owner.employeeId);
  };

  const handleOwnerClear = () => {
    setSelectedOwner(null);
    setFieldValue("ownerId", null);
  };

  return (
    <div className="flex flex-col h-full justify-between gap-[0.625rem]">
      <InputField
        name="name"
        label={translateText(["contactName"])}
        placeholder={translateText(["enterContactName"])}
        value={values.name}
        errorMessage={errors.name || ""}
        required
        onChange={handleChange}
        fullWidth
      />

      <InputField
        name="email"
        label={translateText(["email"])}
        placeholder={translateText(["enterEmail"])}
        value={values.email}
        errorMessage={errors.email || ""}
        required
        onChange={handleChange}
        fullWidth
      />

      <CompanySearchField
        label={translateText(["company"])}
        placeholder={translateText(["enterCompany"])}
        value={values.company}
        onChange={(name, id) => {
          setFieldValue("company", name);
          setFieldValue("companyId", id);
        }}
        options={companyOptions}
        onAddCompany={() => {}}
        addCompanyLabel={translateText(["addCompany"])}
        noResultsText={translateText(["noCompanyFound"])}
      />

      <InputField
        name="contactNumber"
        label={translateText(["contactNo"])}
        placeholder={translateText(["enterContactNo"])}
        value={values.contactNumber}
        onChange={handleChange}
        fullWidth
      />

      <OwnerSearchField
        label={translateText(["contactOwner"])}
        placeholder={translateText(["searchOwner"])}
        selectedOwner={selectedOwner}
        onSelect={handleOwnerSelect}
        onClear={handleOwnerClear}
        options={ownerOptions}
        noResultsText={translateText(["noOwnerFound"])}
        readonly={isCrmSalesRepresentative && !isCrmSalesManager && !isCrmAdmin && !isSuperAdmin}
      />

      <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
        <ButtonV2
          variant="tertiary"
          icon={<CloseIcon />}
          iconPosition="end"
          type="button"
          onClick={() => { setIsAddContactModalOpen(false); setCrmModalType(CrmModalTypes.ADD_CONTACT_MODAL); }}
        >
          {translateText(["cancel"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          icon={<EastArrowIcon />}
          iconPosition="end"
          type="button"
          disabled={isPending}
          onClick={() => handleSubmit()}
        >
          {translateText(["save"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default CreateContactModal;
