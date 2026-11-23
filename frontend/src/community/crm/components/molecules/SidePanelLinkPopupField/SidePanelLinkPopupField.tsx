import {
  DropdownOption,
  DropdownValue,
  DropdownWithSearchablePopup,
  TriggerProps
} from "@rootcodelabs/skapp-ui";
import { FC, RefObject } from "react";

import SidePanelLinkButton from "~community/crm/components/molecules/SidePanelLinkButton/SidePanelLinkButton";

interface Props {
  id: string;
  options: DropdownOption[];
  selectedId: number | null;
  linkLabel: string;
  emptyLabel: string;
  editAriaLabel: string;
  searchPlaceholder: string;
  noResultsText: string;
  onLinkClick: () => void;
  onSearch: (searchTerm: string) => void;
  onSelect: (id: number) => void;
}

const SidePanelLinkPopupField: FC<Props> = ({
  id,
  options,
  selectedId,
  linkLabel,
  emptyLabel,
  editAriaLabel,
  searchPlaceholder,
  noResultsText,
  onLinkClick,
  onSearch,
  onSelect
}) => {
  const selectedValue: DropdownOption | null = selectedId
    ? { id: selectedId, value: selectedId, label: linkLabel }
    : null;

  const handleChange = (value: DropdownValue | null): void => {
    if (value) onSelect(Number((value as DropdownOption).id));
  };

  const handleRenderTrigger = (triggerProps: TriggerProps) => (
    <div className="relative flex w-full min-w-0 min-h-8 items-center px-1 rounded-lg border border-transparent hover:border-secondary-accent">
      <button
        id={id}
        type="button"
        {...triggerProps}
        ref={triggerProps.ref as RefObject<HTMLButtonElement>}
        aria-label={editAriaLabel}
        className="body2 absolute inset-0 flex items-center px-1 rounded-lg text-left cursor-pointer"
      >
        {!selectedId && emptyLabel}
      </button>
      {selectedId && (
        <span className="relative flex min-w-0">
          <SidePanelLinkButton label={linkLabel} onClick={onLinkClick} />
        </span>
      )}
    </div>
  );

  return (
    <div className="-m-1 flex-1 min-w-0">
      <DropdownWithSearchablePopup
        options={options}
        value={selectedValue}
        onChange={handleChange}
        onSearch={onSearch}
        searchPlaceholder={searchPlaceholder}
        searchable
        width="w-full"
        popupWidth="w-[calc(100%+9.5rem+2px)]"
        popupAlignment="right"
        popupOffset={{ x: 9 }}
        renderTrigger={(_value, _isOpen, _disabled, triggerProps) =>
          handleRenderTrigger(triggerProps)
        }
        renderNoResults={() => (
          <div className="px-4 py-2 body2 text-tertiary-text">
            {noResultsText}
          </div>
        )}
      />
    </div>
  );
};

export default SidePanelLinkPopupField;
