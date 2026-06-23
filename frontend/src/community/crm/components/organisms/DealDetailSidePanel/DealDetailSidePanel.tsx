import {
  Button,
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
  CrmOwner,
  TaskRowResponseType
} from "~community/crm/types/CommonTypes";

import DealPropertiesSidebar from "./DealPropertiesSidebar";

const DealDetailSidePanel: FC<SidePanelProps> = ({ isOpen }) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");

  const { selectedDealId, setSelectedDealId, setIsCrmSidePanelOpen } =
    useCrmStore((store) => ({
      selectedDealId: store.selectedDealId,
      setSelectedDealId: store.setSelectedDealId,
      setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen
    }));

  const handleClose = (): void => {
    setSelectedDealId(null);
    setIsCrmSidePanelOpen(false);
  };

  const { data: deal } = useGetDealById(
    selectedDealId ?? 0,
    isOpen && !!selectedDealId
  );

  // Fetch tasks filtered by deal
  const { data: relatedTasks = [] } = useGetRelatedTasks(
    null,
    selectedDealId ?? 0,
    undefined,
    isOpen && !!selectedDealId
  );

  // Convert to TaskRowResponseType format for display
  const tasks: TaskRowResponseType[] = useMemo(
    () =>
      relatedTasks.map((task) => ({
        id: task.id,
        name: task.name,
        type: task.typeName,
        priority: task.priority,
        isCompleted: task.isCompleted,
        dueAt: task.dueAt,
        owner: task.owner,
        contact: task.contact
      })),
    [relatedTasks]
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
      setSelectedOwner(deal.owner ?? null);
      if (deal.stage) {
        setSelectedStageId(String(deal.stage.id));
      }
      setEditedTitle(deal.name ?? "");
      setEditedDescription(deal.description ?? "");
    }
  }, [deal]);

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
    // TODO: Add API call to update deal name
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
    // TODO: Add API call to update deal description
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
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <InputField
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSaveTitle();
                    }
                  }}
                  className="w-full"
                  autoFocus
                  style={{
                    fontSize: "20px",
                    fontWeight: 700
                  }}
                />
              </div>
              <div className="flex gap-2">
                <IconButton
                  aria-label="Save title"
                  isRounded={true}
                  icon={<TickIcon fill="#408ce4" />}
                  onClick={handleSaveTitle}
                  variant="outlined"
                />
                <IconButton
                  aria-label="Discard title"
                  isRounded={true}
                  icon={<CloseIcon />}
                  onClick={handleDiscardTitle}
                />
              </div>
            </div>
          ) : (
            <h2
              className="h2 cursor-pointer hover:bg-secondary-background py-1 px-2 rounded"
              onClick={handleTitleClick}
            >
              {deal?.name}
            </h2>
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
                      <Button
                        onClick={handleDiscardDescription}
                        size="lg"
                        type="button"
                        variant="tertiary"
                      >
                        Discard
                      </Button>
                      <Button
                        onClick={handleSaveDescription}
                        size="lg"
                        type="button"
                        variant="primary"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p
                    className="subtitle1 text-secondary-text cursor-pointer hover:bg-secondary-background py-1 px-2 rounded"
                    onClick={handleDescriptionClick}
                  >
                    {deal?.description ?? translateText(["noDescription"])}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="h2">{translateText(["tasks"])}</h3>
                <SidePanelTasksSection tasks={tasks} />
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
