import { FC, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import OwnerAvatarChip from "~community/crm/v2/components/atoms/OwnerAvatarChip/OwnerAvatarChip";
import OwnerPopupSearch from "~community/crm/v2/components/molecules/OwnerPopupSearch/OwnerPopupSearch";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmOwnerEntity } from "~community/crm/v2/types/CrmCommonTypes";

import EditableCell from "./EditableCell";

interface Props {
  dealId?: number;
  ownerId?: number;
  onSave: (owner: CrmOwnerEntity) => void;
}

const DealOwnerCell: FC<Props> = ({ dealId, ownerId, onSave }) => {
  const translateText = useTranslator("crmModuleV2");
  const translateAria = useTranslator("crmAriaV2");
  const [isEditing, setIsEditing] = useState(false);

  const owners = useCrmStoreV2(useShallow((store) => store.owners));
  const owner = ownerId != null ? (owners[ownerId] ?? null) : null;

  const handleChange = (nextOwner: CrmOwnerEntity | null): void => {
    setIsEditing(false);
    if (nextOwner && nextOwner.employeeId !== owner?.employeeId) {
      onSave(nextOwner);
    }
  };

  return (
    <EditableCell
      isEditing={isEditing}
      ariaLabel={translateAria(["deals", "table", "inlineEdit", "dealOwner"])}
      onStartEditing={() => setIsEditing(true)}
      onClickOutside={() => setIsEditing(false)}
      display={
        owner ? (
          <OwnerAvatarChip
            id={`deal-${dealId}-owner-${owner.employeeId}`}
            owner={owner}
            backgroundColor="bg-secondary-background"
          />
        ) : (
          <span className="body2">-</span>
        )
      }
    >
      <OwnerPopupSearch
        selectedUser={owner}
        onChange={handleChange}
        placeholder={translateText(["deals", "common", "placeholders", "none"])}
        searchPlaceholder={translateText([
          "deals",
          "common",
          "placeholders",
          "ownerSearch"
        ])}
        noResultsText={translateText([
          "deals",
          "common",
          "placeholders",
          "noResults"
        ])}
      />
    </EditableCell>
  );
};

export default DealOwnerCell;
