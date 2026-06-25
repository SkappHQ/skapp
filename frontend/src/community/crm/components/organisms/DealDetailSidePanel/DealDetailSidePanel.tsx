import {
  ButtonV2,
  CloseIcon,
  DeleteButtonIcon,
  IconButton,
  InputField,
  KebabMenu,
  SidePanel,
  SidePanelProps,
  TextArea,
  TickIcon
} from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useMemo, useState } from "react";

import HandshakeIcon from "~community/common/assets/Icons/HandshakeIcon";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useGetCrmContacts } from "~community/crm/api/ContactApi";
import { useGetRelatedTasks } from "~community/crm/api/TaskApi";
import { useGetDealById, useGetDealStages } from "~community/crm/api/crmDealApi";
import DeleteDealModal from "~community/crm/components/molecules/DeleteDealModal/DeleteDealModal";
import SidePanelTasksSection from "~community/crm/components/molecules/SidePanelTasksSection/SidePanelTasksSection";
import {
  DEFAULT_LOOKUP_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/commonConstants";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmContactLookup,
  CrmOwner
} from "~community/crm/types/CommonTypes";

import DealPropertiesSidebar from "./DealPropertiesSidebar";

const DealDetailSidePanel: FC<SidePanelProps> = ({ isOpen, onClose }) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");

  const { selectedDealId, setIsCrmSidePanelOpen } =
    useCrmStore((store) => ({
      selectedDealId: store.selectedDealId,
      setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen
    }));

  const { setToastMessage } = useToast();

  const handleClose = (): void => {
    setIsCrmSidePanelOpen(false);
  };

  const handleDealLoadError = (): void => {
    setToastMessage({
      open: true,
      toastType: "error",
      title: translateText(["errors", "dealNotFoundTitle"]),
      description: translateText(["errors", "dealNotFoundDescription"])
    });
    handleClose();
  };

  const {
    data: deal,

    isError: isDealError
  } = useGetDealById(selectedDealId ?? 0, isOpen && !!selectedDealId);

  const { data: relatedTasks = [] } = useGetRelatedTasks(
    null,
    selectedDealId,
    undefined,
    isOpen && !!selectedDealId
  );



  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [priority, setPriority] = useState<CrmPriorityEnum>(
    CrmPriorityEnum.MEDIUM
  );
  const [selectedStageId, setSelectedStageId] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<CrmOwner | null>(null);
  const [selectedContact, setSelectedContact] =
    useState<CrmContactLookup | null>(null);
  const [contactSearchTerm, setContactSearchTerm] = useState("");

  // Editable title state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");

  // Editable description state
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");

  const debouncedContactSearch = useDebounce(
    contactSearchTerm.trim(),
    SEARCH_DEBOUNCE_DELAY
  );

  const { data: contactLookupData } = useGetCrmContacts(
    debouncedContactSearch,
    DEFAULT_LOOKUP_PAGE_SIZE,
    isOpen
  );
  const contacts = contactLookupData?.items ?? [];

  const {
    data: stages = [],
    isLoading: isStagesLoading
  } = useGetDealStages(isOpen);

  const stageOptions = useMemo(
    () =>
      stages.map((s) => ({
        id: String(s.id),
        value: String(s.id),
        label: (
          <div className="inline-flex items-center gap-2.5">
            <div
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="body2">{s.name}</span>
          </div>
        )
      })),
    [stages]
  );

  useEffect(() => {
    if (deal) {
      setAmount(deal.amount ?? "");
      setSelectedOwner(deal.owner);
      setSelectedStageId(String(deal.stage.id));
      setEditedTitle(deal.name);
      setEditedDescription(deal.description ?? "");
      setPriority(deal.priority);
      setSelectedContact(deal.contact);
    }
  }, [deal]);

  useEffect(() => {
    if (isDealError) {
      handleDealLoadError();
    }
  }, [isDealError]);

  const menuItems = [
    {
      id: "delete",
      label: translateText(["deleteDeal"]),
      icon: {
        start: (
          <DeleteButtonIcon
            width="12px"
            height="14px"
            fill="var(--color-semantic-red-text)"
          />
        )
      },
      activeBehavior: "hover:bg-semantic-red-background text-semantic-red-text",
      onClick: () => setIsDeleteModalOpen(true)
    }
  ];

  // Title editing handlers
  const handleTitleClick = () => {
    setIsEditingTitle(true);
    setEditedTitle(deal?.name ?? "");
  };

  const handleSaveTitle = async () => {
    setIsEditingTitle(false);
  };

  const handleDiscardTitle = () => {
    setEditedTitle(deal?.name ?? "");
    setIsEditingTitle(false);
  };

  // Description editing handlers
  const handleDescriptionClick = () => {
    setIsEditingDescription(true);
    setEditedDescription(deal?.description ?? "");
  };

  const handleSaveDescription = async () => {
    setIsEditingDescription(false);
  };

  const handleDiscardDescription = () => {
    setEditedDescription(deal?.description ?? "");
    setIsEditingDescription(false);
  };

  return (
    <>
      <SidePanel
        isOpen={isOpen}
        onClose={handleClose}
        animation="slide"
        closeOnBackdropClick
        header={
          <div className="flex flex-col gap-3 pl-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-6 rounded-full shrink-0 bg-status-pink">
                <HandshakeIcon
                  width="14"
                  height="14"
                  fill="var(--color-white)"
                />
              </div>
              <span className="body1 text-secondary-icon">
                #{selectedDealId}
              </span>
            </div>
          </div>
        }
        headerActions={
          <KebabMenu
            id="deal-actions"
            menuItems={menuItems}
            anchorButton={{
              "aria-label": translateText(["kebabMenuAriaLabel"])
            }}
            className={{
              anchorElement:
                "hover:bg-secondary-accent bg-tertiary-background w-9 h-9"
            }}
          />
        }
      >
        <div className="flex flex-col gap-6">
          {/* Editable Title */}
          {isEditingTitle ? (
            <div className="flex gap-6 items-center min-w-0">
              <div className="flex-1 min-w-0 p-1">
                <InputField
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSaveTitle();
                    }
                  }}
                  className="w-full h2"
                  autoFocus
                />
              </div>
              <div className="w-1/3 shrink-0 flex justify-start items-center">
                <div className="flex gap-2">
                  <IconButton
                    aria-label={translateText(["ariaLabels", "saveTitle"])}
                    isRounded={true}
                    icon={<TickIcon fill="var(--color-primary-accent)" />}
                    onClick={handleSaveTitle}
                    variant="outlined"
                  />
                  <IconButton
                    aria-label={translateText(["ariaLabels", "discardTitle"])}
                    isRounded={true}
                    icon={<CloseIcon />}
                    onClick={handleDiscardTitle}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-6 items-center min-w-0">
              <div className="flex-1 min-w-0">
                <div
                  role="button"
                  tabIndex={0}
                  className="text-black h2 text-left w-full cursor-pointer hover:bg-secondary-background py-1 rounded bg-transparent border-none"
                  aria-label={translateText(["ariaLabels", "editTitle"])}
                  onClick={handleTitleClick}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleTitleClick();
                    }
                  }}
                >
                  {deal?.name}
                </div>
              </div>
              <div className="w-1/3 shrink-0">
              </div>
            </div>
          )}

          <div className="flex gap-6 items-start">
            {/* Left: Description + Tasks */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">
              {/* Editable Description */}
              <div className="flex flex-col gap-1">
                <p className="subtitle1">{translateText(["description"])}</p>
                {isEditingDescription ? (
                  <div className="flex flex-col gap-3">
                    <TextArea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="w-full"
                      rows={4}
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <ButtonV2
                        onClick={handleDiscardDescription}
                        size="md"
                        type="button"
                        variant="tertiary"
                      >
                        {translateText(["buttons", "discard"])}
                      </ButtonV2>
                      <ButtonV2
                        onClick={handleSaveDescription}
                        size="md"
                        type="button"
                        variant="primary"
                      >
                        {translateText(["buttons", "save"])}
                      </ButtonV2>
                    </div>
                  </div>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    className="subtitle1 text-secondary-text text-left w-full cursor-pointer hover:bg-secondary-background py-1 px-2 rounded bg-transparent border-none"
                    aria-label={translateText(["ariaLabels", "editDescription"])}
                    onClick={handleDescriptionClick}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleDescriptionClick();
                      }
                    }}
                  >
                    {deal?.description ?? translateText(["noDescription"])}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="h2">{translateText(["tasks"])}</h3>
                <SidePanelTasksSection tasks={relatedTasks} />
              </div>
            </div>

            {/* Right: Stage + Properties */}
            <DealPropertiesSidebar
              stage={{
                isLoading: isStagesLoading,
                options: stageOptions,
                selectedId: selectedStageId,
                onChange: (v) => setSelectedStageId(String(v))
              }}
              properties={{
                amount,
                priority,
                owner: selectedOwner,
                contact: selectedContact
              }}
              handlers={{
                onAmountChange: setAmount,
                onPriorityChange: setPriority,
                onOwnerChange: setSelectedOwner,
                onContactChange: setSelectedContact,
                onContactSearch: setContactSearchTerm
              }}
              contacts={contacts}
            />
          </div>
        </div>
      </SidePanel>

      <DeleteDealModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        dealName={deal?.name ?? ""}
      />
    </>
  );
};

export default DealDetailSidePanel;
