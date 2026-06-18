import { FormikProps } from "formik";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import ContactPopupSearch from "~community/crm/components/molecules/ContactPopupSearch/ContactPopupSearch";
import OwnerPopupSearch from "~community/crm/components/molecules/OwnerPopupSearch/OwnerPopupSearch";
import PriorityDropdown from "~community/crm/components/molecules/PriorityDropdown/PriorityDropdown";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import {
  CrmContactLookup,
  CrmDealAddFormTypes,
  CrmOwner
} from "~community/crm/types/CommonTypes";

import AmountField from "./AmountField";

interface OwnerFieldProps {
  users: CrmOwner[];
  selected: CrmOwner | null;
  onSelect: (user: CrmOwner | null) => void;
  onSearch: (term: string) => void;
  isReadonly: boolean;
}

interface ContactFieldProps {
  contacts: CrmContactLookup[];
  selected: CrmContactLookup | null;
  onSelect: (c: CrmContactLookup | null) => void;
  onSearch: (term: string) => void;
}

interface DealPropertiesSectionProps {
  formik: FormikProps<CrmDealAddFormTypes>;
  owner: OwnerFieldProps;
  contact: ContactFieldProps;
}

const DealPropertiesSection: FC<DealPropertiesSectionProps> = ({
  formik,
  owner,
  contact
}) => {
  const translateText = useTranslator("crmModule", "deals", "addDealSidePanel");
  const { values, errors, touched, setFieldValue } = formik;

  return (
    <div className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2 w-full">
      <PropertyRow label={translateText(["labels", "value"])}>
        <AmountField formik={formik} />
      </PropertyRow>

      <PropertyRow label={translateText(["labels", "priority"])}>
        <PriorityDropdown
          value={values.priority}
          onChange={(v) => setFieldValue("priority", v)}
        />
      </PropertyRow>

      <PropertyRow label={translateText(["labels", "ownedBy"])}>
        <div
          className={`flex flex-col w-full${
            owner.isReadonly ? " pointer-events-none" : ""
          }`}
        >
          <OwnerPopupSearch
            users={owner.users}
            selectedUser={owner.selected}
            onSearch={owner.onSearch}
            onChange={(user: CrmOwner | null) => {
              owner.onSelect(user);
              setFieldValue("ownerId", user ? String(user.employeeId) : "");
            }}
            ariaInvalid={!!(touched.ownerId && errors.ownerId)}
          />
          {touched.ownerId && errors.ownerId && (
            <p className="text-semantic-red-text body3 mt-1">
              {errors.ownerId}
            </p>
          )}
        </div>
      </PropertyRow>

      <PropertyRow label={translateText(["labels", "contactName"])}>
        <div className="flex flex-col w-full">
          <ContactPopupSearch
            contacts={contact.contacts}
            selectedContact={contact.selected}
            onChange={(c: CrmContactLookup | null) => {
              contact.onSelect(c);
              setFieldValue("contactId", c ? String(c.id) : "");
            }}
            onSearch={contact.onSearch}
            placeholder={translateText(["placeholders", "none"])}
            searchPlaceholder={translateText(["placeholders", "contactSearch"])}
            noResultsText={translateText(["placeholders", "noResults"])}
            ariaInvalid={!!(touched.contactId && errors.contactId)}
          />
          {touched.contactId && errors.contactId && (
            <p className="text-semantic-red-text body3 mt-1">
              {errors.contactId}
            </p>
          )}
        </div>
      </PropertyRow>
    </div>
  );
};

export default DealPropertiesSection;
