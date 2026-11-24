import {
  DropdownOption,
  DropdownValue,
  DropdownWithSearchablePopup,
  TriggerProps
} from "@rootcodelabs/skapp-ui";
import { CSSProperties, FC, RefObject, useRef } from "react";

import SidePanelLinkButton from "~community/crm/components/molecules/SidePanelLinkButton/SidePanelLinkButton";
import useCardAlignedPopup from "~community/crm/hooks/useCardAlignedPopup";

interface Props {
  id: string;
  cardRef: RefObject<HTMLDivElement | null>;
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
  cardRef,
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
  const fieldRef = useRef<HTMLDivElement>(null);
  const popup = useCardAlignedPopup(cardRef, fieldRef);

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
    <div
      ref={fieldRef}
      className="-m-1 flex-1 min-w-0"
      style={{ "--card-popup-width": `${popup.width}px` } as CSSProperties}
    >
      <DropdownWithSearchablePopup
        options={options}
        value={selectedValue}
        onChange={handleChange}
        onSearch={onSearch}
        searchPlaceholder={searchPlaceholder}
        searchable
        width="w-full"
        popupWidth="w-[var(--card-popup-width)]"
        popupAlignment="right"
        popupOffset={{ x: popup.offsetX }}
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
