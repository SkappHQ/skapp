import { FormikProps } from "formik";
import { FC, useEffect, useMemo, useState } from "react";

import ContactPopupSearch from "~community/crm/components/molecules/ContactPopupSearch/ContactPopupSearch";
import OwnerPopupSearch from "~community/crm/components/molecules/OwnerPopupSearch/OwnerPopupSearch";
import PriorityDropdown from "~community/crm/components/molecules/PriorityDropdown/PriorityDropdown";
import PropertyField from "~community/crm/components/molecules/PropertyField/PropertyField";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import {
  CrmContactLookup,
  CrmDealAddFormTypes,
  CrmOwner
} from "~community/crm/types/CommonTypes";
import { validateDealAmount } from "~community/crm/utils/dealValidations";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

interface DealPropertiesSectionProps {
  translateText: (keys: string[]) => string;
  formik: FormikProps<CrmDealAddFormTypes>;
  contacts: CrmContactLookup[];
  selectedContact: CrmContactLookup | null;
  setSelectedContact: (c: CrmContactLookup | null) => void;
  setContactSearchTerm: (term: string) => void;
}

const DealPropertiesSection: FC<DealPropertiesSectionProps> = ({
  translateText,
  formik,
  contacts,
  selectedContact,
  setSelectedContact,
  setContactSearchTerm
}) => {
  const { values, errors, touched, setFieldValue } = formik;

  const { data: currentUser } = useGetUserPersonalDetails();

  const defaultOwner = useMemo((): CrmOwner | null => {
    if (!currentUser?.employeeId) return null;
    return {
      employeeId: Number(currentUser.employeeId),
      firstName: currentUser.firstName ?? "",
      lastName: currentUser.lastName ?? null,
      authPic: currentUser.authPic as string | null
    };
  }, [currentUser]);

  const [selectedOwner, setSelectedOwner] = useState<CrmOwner | null>(null);

  useEffect(() => {
    if (defaultOwner) {
      setSelectedOwner(defaultOwner);
      setFieldValue("ownerId", String(defaultOwner.employeeId));
    }
  }, [defaultOwner]);

  const handleOwnerChange = (u: CrmOwner | null) => {
    setSelectedOwner(u);
    setFieldValue("ownerId", u ? String(u.employeeId) : "");
  };

  const handleContactChange = (c: CrmContactLookup | null) => {
    setSelectedContact(c);
    setFieldValue("contactId", c ? String(c.id) : "");
  };

  const handlePriorityChange = (priority: string) => {
    setFieldValue("priority", priority);
  };

  return (
    <div className="border border-secondary-accent rounded-lg p-3 flex flex-col gap-2 w-full">
      <PropertyRow label={translateText(["labels", "contactName"])} required>
        <div className="flex flex-col w-full">
          <ContactPopupSearch
            contacts={contacts}
            selectedContact={selectedContact}
            onChange={handleContactChange}
            onSearch={setContactSearchTerm}
            placeholder={translateText(["placeholders", "none"])}
            searchPlaceholder={translateText(["placeholders", "contactSearch"])}
            noResultsText={translateText(["placeholders", "noResults"])}
            ariaInvalid={!!errors.contactId}
            ariaRequired
          />
          {errors.contactId && touched.contactId && (
            <p className="text-semantic-red-accent body3 mt-1">
              {errors.contactId}
            </p>
          )}
        </div>
      </PropertyRow>

      <PropertyField
        label={translateText(["labels", "value"])}
        value={values.amount}
        placeholder={translateText(["placeholders", "none"])}
        validate={(value) => validateDealAmount(value, translateText)}
        onSave={(value) => setFieldValue("amount", value)}
      />

      <PropertyRow label={translateText(["labels", "priority"])}>
        <PriorityDropdown
          value={values.priority}
          onChange={handlePriorityChange}
        />
      </PropertyRow>

      <PropertyRow label={translateText(["labels", "ownedBy"])}>
        <div className={"flex flex-col w-full"}>
          <OwnerPopupSearch
            selectedUser={selectedOwner}
            onChange={handleOwnerChange}
            placeholder={translateText(["placeholders", "none"])}
            searchPlaceholder={translateText(["placeholders", "ownerSearch"])}
            noResultsText={translateText(["placeholders", "noResults"])}
            ariaInvalid={!!errors.ownerId}
          />
          {errors.ownerId && (
            <p className="text-semantic-red-accent body3 mt-1">
              {errors.ownerId}
            </p>
          )}
        </div>
      </PropertyRow>
    </div>
  );
};

export default DealPropertiesSection;
