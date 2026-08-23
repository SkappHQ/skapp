import { FormikProps } from "formik";
import { FC, useEffect, useMemo, useState } from "react";

import ContactPopupSearch from "~community/crm/v2/components/molecules/ContactPopupSearch/ContactPopupSearch";
import OwnerPopupSearch from "~community/crm/v2/components/molecules/OwnerPopupSearch/OwnerPopupSearch";
import PriorityDropdown from "~community/crm/v2/components/molecules/PriorityDropdown/PriorityDropdown";
import PropertyField from "~community/crm/v2/components/molecules/PropertyField/PropertyField";
import PropertyRow from "~community/crm/v2/components/molecules/PropertyRow/PropertyRow";
import { CrmPriorityEnum } from "~community/crm/v2/enums/common";
import {
  CrmCompanyRecord,
  CrmContactEntity,
  CrmDealEntity,
  CrmOwnerEntity
} from "~community/crm/v2/types/CrmCommonTypes";
import { validateDealAmount } from "~community/crm/v2/utils/dealValidations";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

interface DealPropertiesSectionProps {
  translateText: (keys: string[]) => string;
  formik: FormikProps<CrmDealEntity>;
  contacts: CrmContactEntity[];
  companies: CrmCompanyRecord;
  selectedContact: CrmContactEntity | null;
  setSelectedContact: (contact: CrmContactEntity | null) => void;
  setContactSearchTerm: (term: string) => void;
}

const DealPropertiesSection: FC<DealPropertiesSectionProps> = ({
  translateText,
  formik,
  contacts,
  companies,
  selectedContact,
  setSelectedContact,
  setContactSearchTerm
}) => {
  const { values, errors, touched, setFieldValue } = formik;

  const { data: currentUser } = useGetUserPersonalDetails();

  const defaultOwner = useMemo((): CrmOwnerEntity | null => {
    if (!currentUser?.employeeId) return null;
    return {
      employeeId: Number(currentUser.employeeId),
      firstName: currentUser.firstName ?? "",
      lastName: currentUser.lastName ?? undefined,
      authPic: (currentUser.authPic as string | null) ?? undefined
    };
  }, [currentUser]);

  const [selectedOwner, setSelectedOwner] = useState<CrmOwnerEntity | null>(
    null
  );

  useEffect(() => {
    if (defaultOwner) {
      setSelectedOwner(defaultOwner);
      setFieldValue("ownerId", defaultOwner.employeeId);
    }
  }, [defaultOwner]);

  const handleOwnerChange = (owner: CrmOwnerEntity | null) => {
    setSelectedOwner(owner);
    setFieldValue("ownerId", owner ? owner.employeeId : undefined);
  };

  const handleContactChange = (contact: CrmContactEntity | null) => {
    setSelectedContact(contact);
    setFieldValue("contactId", contact ? contact.id : undefined);
  };

  const handlePriorityChange = (priority: string) => {
    setFieldValue("priority", priority as CrmPriorityEnum);
  };

  return (
    <div className="border border-secondary-accent rounded-lg p-3 flex flex-col gap-2 w-full">
      <PropertyRow label={translateText(["labels", "contactName"])} required>
        <div className="flex flex-col w-full">
          <ContactPopupSearch
            contacts={contacts}
            companies={companies}
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
        value={values.amount ?? ""}
        placeholder={translateText(["placeholders", "none"])}
        ariaLabel={translateText(["ariaLabels", "amount"])}
        validate={(value) => validateDealAmount(value, translateText)}
        onChange={(value) => setFieldValue("amount", value)}
        onSave={(value) => setFieldValue("amount", value)}
      />

      <PropertyRow label={translateText(["labels", "priority"])}>
        <PriorityDropdown
          value={values.priority ?? CrmPriorityEnum.MEDIUM}
          onChange={handlePriorityChange}
        />
      </PropertyRow>

      <PropertyRow label={translateText(["labels", "ownedBy"])} required>
        <div className="flex flex-col w-full">
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
