import useSessionData from "~community/common/hooks/useSessionData";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import EditableContactOwnerField from "~community/crm/components/molecules/EditableContactOwnerField/EditableContactOwnerField";
import SelectedOwnerField from "~community/crm/components/molecules/SelectedOwnerField/SelectedOwnerField";
import { CrmOwner } from "~community/crm/types/CommonTypes";

interface ContactOwnerFieldProps {
  owner: CrmOwner | null;
  errorMessage?: string;
  translateContactText: TranslatorFunctionType;
  onChange: (owner: CrmOwner | null) => void;
}

const ContactOwnerField = ({
  owner,
  errorMessage,
  translateContactText,
  onChange
}: ContactOwnerFieldProps) => {
  
  const { isCrmSalesManager: canEditOwner } = useSessionData();

  if (canEditOwner) {
    return (
      <EditableContactOwnerField
        initialOwner={owner}
        errorMessage={errorMessage}
        translateContactText={translateContactText}
        onChange={onChange}
      />
    );
  }

  return (
    <SelectedOwnerField
      label={translateContactText(["labels", "owner"])}
      owner={owner}
      onRemove={() => undefined}
      showRemoveButton={false}
      ariaLabel={translateContactText(["ariaLabels", "clearOwner"])}
    />
  );
};

export default ContactOwnerField;
