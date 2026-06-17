import { FormikProps } from "formik";
import { FC } from "react";

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

interface DealPropertiesSectionProps {
  translateText: (keys: string[]) => string;
  formik: FormikProps<CrmDealAddFormTypes>;
  editingField: string | null;
  setEditingField: (field: string | null) => void;
  isOwnerReadonly: boolean;
  owners: CrmOwner[];
  selectedOwner: CrmOwner | null;
  setSelectedOwner: (user: CrmOwner | null) => void;
  setOwnerSearchTerm: (term: string) => void;
  contacts: CrmContactLookup[];
  selectedContact: CrmContactLookup | null;
  setSelectedContact: (c: CrmContactLookup | null) => void;
  setContactSearchTerm: (term: string) => void;
}

const DealPropertiesSection: FC<DealPropertiesSectionProps> = ({
  translateText,
  formik,
  editingField,
  setEditingField,
  isOwnerReadonly,
  owners,
  selectedOwner,
  setSelectedOwner,
  setOwnerSearchTerm,
  contacts,
  selectedContact,
  setSelectedContact,
  setContactSearchTerm
}) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    formik;

  return (
    <div className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2 w-full">
      <PropertyRow label={translateText(["labels", "value"])}>
        <AmountField
          isEditing={editingField === "amount"}
          value={values.amount}
          isTouched={touched.amount}
          error={errors.amount}
          placeholder={translateText(["placeholders", "amount"])}
          nonePlaceholder={translateText(["placeholders", "none"])}
          ariaLabel={translateText(["ariaLabels", "amount"])}
          onEdit={() => setEditingField("amount")}
          onChange={handleChange}
          onBlur={(e) => {
            handleBlur(e);
            setEditingField(null);
          }}
        />
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
            isOwnerReadonly ? " pointer-events-none" : ""
          }`}
        >
          <OwnerPopupSearch
            users={owners}
            selectedUser={selectedOwner}
            onSearch={setOwnerSearchTerm}
            onChange={(user: CrmOwner | null) => {
              setSelectedOwner(user);
              setFieldValue("ownerId", user ? String(user.employeeId) : "");
            }}
            placeholder={translateText(["placeholders", "none"])}
            searchPlaceholder={translateText(["placeholders", "ownerSearch"])}
            noResultsText={translateText(["placeholders", "noResults"])}
            ariaInvalid={!!(touched.ownerId && errors.ownerId)}
            chipBackgroundColor="bg-gray-100"
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
            contacts={contacts}
            selectedContact={selectedContact}
            onChange={(c: CrmContactLookup | null) => {
              setSelectedContact(c);
              setFieldValue("contactId", c ? String(c.id) : "");
            }}
            onSearch={setContactSearchTerm}
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
