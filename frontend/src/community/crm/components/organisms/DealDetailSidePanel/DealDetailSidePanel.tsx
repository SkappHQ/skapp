import {
  CloseIcon,
  IconButton,
  InputField,
  KebabMenu,
  SidePanel,
  TickIcon
} from "@rootcodelabs/skapp-ui";
import type { DropdownOption } from "@rootcodelabs/skapp-ui/dist/types/components/molecules/Dropdown/Dropdown";
import { FC, ReactNode, useEffect, useState } from "react";

import BinIcon from "~community/common/assets/Icons/BinIcon";

import {
  CrmCompanyType,
  CrmContactType,
  CrmDealListItem,
  CrmOwner
} from "~community/crm/types/CommonTypes";
import { useCrmStore } from "~community/crm/store/store";

import DealDescription from "./DealDescription";
import DealProperties from "./DealProperties";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  isOpen: boolean;
  onClose: () => void;
  deal: CrmDealListItem | null;
  dealIcon?: ReactNode;
  stageOptions?: DropdownOption[];
  owners?: CrmOwner[];
  contacts?: CrmContactType[];
  companies?: CrmCompanyType[];
  onOwnerSearch?: (term: string) => void;
}

// ---------------------------------------------------------------------------
// DealDetailSidePanel
// ---------------------------------------------------------------------------

const DealDetailSidePanel: FC<Props> = ({
  isOpen,
  onClose,
  deal,
  dealIcon,
  stageOptions = [],
  owners = [],
  contacts = [],
  companies = [],
  onOwnerSearch
}) => {
  const { setIsDealDeleteModalOpen, setDealToDelete } = useCrmStore(
    (store) => ({
      setIsDealDeleteModalOpen: store.setIsDealDeleteModalOpen,
      setDealToDelete: store.setDealToDelete
    })
  );

  const [isEditingName, setIsEditingName] = useState(false);

  // Local editable state seeded from deal prop
  const [nameValue, setNameValue] = useState("");
  const [editedName, setEditedName] = useState("");
  const [descriptionValue, setDescriptionValue] = useState("");
  const [stageValue, setStageValue] = useState("");
  const [amountValue, setAmountValue] = useState("");
  const [priorityValue, setPriorityValue] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<CrmOwner | null>(null);
  const [selectedContact, setSelectedContact] =
    useState<CrmContactType | null>(null);
  const [selectedCompany, setSelectedCompany] =
    useState<CrmCompanyType | null>(null);

  // Seed local state when deal changes
  useEffect(() => {
    if (deal) {
      setNameValue(deal.name);
      setDescriptionValue(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
      );
      setStageValue(deal.stageName);
      setAmountValue(deal.amount ?? "");
      setPriorityValue("");
      setSelectedOwner(deal.owner ?? null);
      setSelectedContact(
        deal.contactName
          ? ({ id: 0, name: deal.contactName } as unknown as CrmContactType)
          : null
      );
      setSelectedCompany(
        deal.companyName
          ? ({ id: 0, name: deal.companyName } as unknown as CrmCompanyType)
          : null
      );
    }
  }, [deal]);

  if (!deal) return null;

  const handleNameClick = () => {
    setIsEditingName(true);
    setEditedName(nameValue);
  };

  const handleSaveName = () => {
    if (editedName.trim()) {
      setNameValue(editedName.trim());
    }
    setIsEditingName(false);
  };

  const handleDiscardName = () => {
    setEditedName(nameValue);
    setIsEditingName(false);
  };

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      width="lg"
      animation="slide"
      closeOnBackdropClick
      header={
        <div className="flex flex-col gap-3 pl-2">
          <div className="flex items-center gap-2">
            {dealIcon && (
              <div className="flex items-center justify-center size-6 rounded-full shrink-0 bg-teal-500">
                {dealIcon}
              </div>
            )}
            <span className="body1 text-secondary-icon">
              #{deal.id}
            </span>
          </div>
        </div>
      }
      headerActions={
        <div className="flex items-center">
          <KebabMenu
            id="deal-detail-kebab"
            position="bottom-right"
            menuItems={[
              {
                id: "delete",
                label: "Delete deal",
                icon: { start: <BinIcon fill="currentColor" width="16" height="16" /> },
                onClick: () => {
                  setDealToDelete(nameValue);
                  setIsDealDeleteModalOpen(true);
                }
              }
            ]}
            className={{
              kebabMenu: {
                menuItem: {
                  container:
                    "w-[227px] h-[48px] rounded-xl border-[0.8px] border-semantic-red-background bg-semantic-red-background hover:bg-semantic-red-background",
                  label: "text-semantic-red-text",
                  icon: { start: "text-semantic-red-text" }
                }
              }
            }}
          />
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {isEditingName ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 p-1">
              <InputField
                name="name"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSaveName();
                  }
                }}
                placeholder="Deal name"
                className="w-full"
                autoFocus
              />
            </div>
            <IconButton
              aria-label="Save name"
              isRounded
              icon={<TickIcon fill="#408ce4" />}
              onClick={handleSaveName}
              variant="outlined"
            />
            <IconButton
              aria-label="Discard name"
              isRounded
              icon={<CloseIcon />}
              onClick={handleDiscardName}
            />
          </div>
        ) : (
          <div
            className="h1 cursor-pointer hover:bg-secondary-background py-1 rounded"
            onClick={handleNameClick}
          >
            {nameValue || deal.name}
          </div>
        )}
      </div>
      <div className="flex gap-6 h-full">
        {/* ── Left column: Description ── */}
        <div className="flex-[2_1_0] min-w-0 flex flex-col gap-4">
          <DealDescription
            value={descriptionValue}
            onChange={setDescriptionValue}
          />
        </div>

        {/* ── Right column: Stage + Property card ── */}
        <DealProperties
          stageOptions={stageOptions}
          stageValue={stageValue}
          onStageChange={setStageValue}
          amountValue={amountValue}
          onAmountChange={setAmountValue}
          priorityValue={priorityValue}
          onPriorityChange={setPriorityValue}
          selectedOwner={selectedOwner}
          onOwnerChange={setSelectedOwner}
          owners={owners}
          onOwnerSearch={onOwnerSearch}
          selectedContact={selectedContact}
          onContactChange={setSelectedContact}
          contacts={contacts}
          selectedCompany={selectedCompany}
          onCompanyChange={setSelectedCompany}
          companies={companies}
        />
      </div>
    </SidePanel>
  );
};

export default DealDetailSidePanel;
