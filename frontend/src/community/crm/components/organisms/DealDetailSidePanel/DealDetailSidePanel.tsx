import {
  DeleteButtonIcon,
  Dropdown,
  KebabMenu,
  SidePanel,
  SidePanelProps
} from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useMemo, useState } from "react";

import HandshakeIcon from "~community/common/assets/Icons/HandshakeIcon";
import MultipleSkeletons from "~community/common/components/molecules/Skeletons/MultipleSkeletons";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetCrmContacts } from "~community/crm/api/ContactApi";
import { useGetRelatedTasks } from "~community/crm/api/TaskApi";
import { useGetDealById, useGetDealStages } from "~community/crm/api/crmDealApi";
import ContactPopupSearch from "~community/crm/components/molecules/ContactPopupSearch/ContactPopupSearch";
import DeleteDealModal from "~community/crm/components/molecules/DeleteDealModal/DeleteDealModal";
import OwnerPopupSearch from "~community/crm/components/molecules/OwnerPopupSearch/OwnerPopupSearch";
import PriorityDropdown from "~community/crm/components/molecules/PriorityDropdown/PriorityDropdown";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
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

const DealDetailSidePanel: FC<SidePanelProps> = ({ isOpen }) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");
  const addDealTranslator = useTranslator(
    "crmModule",
    "deals",
    "addDealSidePanel"
  );

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

  const { data: deal } = useGetDealById(selectedDealId, isOpen);

  // Fetch tasks filtered by deal
  const { data: relatedTasks = [] } = useGetRelatedTasks(
    null,
    selectedDealId,
    undefined,
    isOpen
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

  return (
    <>
      <SidePanel
        isOpen={isOpen}
        onClose={handleClose}
        width="lg"
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
          <h2 className="h2">{deal?.name}</h2>

          <div className="flex gap-6 items-start">
            {/* Left: Description + Tasks */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">
              <div className="flex flex-col gap-1">
                <p className="subtitle1">
                  {translateText(["description"])}
                </p>
                <p className="subtitle1 text-secondary-text">
                  {deal?.description ?? translateText(["noDescription"])}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="h2">{translateText(["tasks"])}</h3>
                <SidePanelTasksSection tasks={tasks} />
              </div>
            </div>

            {/* Right: Stage + Properties */}
            <div className="w-1/3 flex flex-col gap-4 shrink-0">
              {isStagesLoading ? (
                <MultipleSkeletons numOfSkeletons={1} height={38} />
              ) : (
                <Dropdown
                  options={stageOptions}
                  value={selectedStageId}
                  onChange={(v) => setSelectedStageId(String(v))}
                  variant="primary"
                  className="rounded-lg"
                  width="55%"
                  placeholder={addDealTranslator(["placeholders", "stage"])}
                  ariaLabel={addDealTranslator(["ariaLabels", "stage"])}
                />
              )}

              <div className="border border-secondary-accent rounded-lg p-3 flex flex-col gap-2 w-full">
                <PropertyRow label={addDealTranslator(["labels", "value"])}>
                  <div className="flex flex-col w-full px-1">
                    <input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={addDealTranslator(["placeholders", "none"])}
                      type="text"
                      className="w-full bg-transparent outline-none body2 placeholder:text-secondary-text"
                      aria-label={addDealTranslator(["ariaLabels", "amount"])}
                    />
                  </div>
                </PropertyRow>

                <PropertyRow label={addDealTranslator(["labels", "priority"])}>
                  <PriorityDropdown value={priority} onChange={setPriority} />
                </PropertyRow>

                <PropertyRow label={addDealTranslator(["labels", "ownedBy"])}>
                  <OwnerPopupSearch
                    selectedUser={selectedOwner}
                    onChange={setSelectedOwner}
                    placeholder={addDealTranslator(["placeholders", "none"])}
                    searchPlaceholder={addDealTranslator([
                      "placeholders",
                      "ownerSearch"
                    ])}
                    noResultsText={addDealTranslator([
                      "placeholders",
                      "noResults"
                    ])}
                  />
                </PropertyRow>

                <PropertyRow
                  label={addDealTranslator(["labels", "contactName"])}
                >
                  <ContactPopupSearch
                    contacts={contacts}
                    selectedContact={selectedContact}
                    onChange={setSelectedContact}
                    onSearch={setContactSearchTerm}
                    placeholder={addDealTranslator(["placeholders", "none"])}
                    searchPlaceholder={addDealTranslator([
                      "placeholders",
                      "contactSearch"
                    ])}
                    noResultsText={addDealTranslator([
                      "placeholders",
                      "noResults"
                    ])}
                  />
                </PropertyRow>
              </div>
            </div>
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
