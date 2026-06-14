import {
  EmptyDataView,
  InputField,
  SearchIcon,
  Tabs
} from "@rootcodelabs/skapp-ui";
import { ChangeEvent, useState } from "react";

import { EmptyStateTypeEnum } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { TASK_SEARCH_DEBOUNCE_DELAY } from "~community/crm/constants/taskConstants";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import { useGetTasksTabs } from "~community/crm/hooks/useGetTasksTabs";
import { CrmTaskType } from "~community/crm/types/CommonTypes";

import TaskRow from "../../molecules/AddCompanyModalContent/TaskRow/TaskRow";
import SidePanelTasksSection from "../../molecules/SidePanelTasksSection/SidePanelTasksSection";

const MOCK_TASK: CrmTaskType = {
  id: 1,
  name: "Follow up with John about proposal",
  type: { id: 1, name: "call", orderIndex: 1 },
  priority: CrmPriorityEnum.HIGH,
  isCompleted: true,
  dueAt: new Date().toISOString(),
  notes: null,
  owner: {
    id: 1,
    firstName: "Alice",
    lastName: "Smith",
    authPic: null
  },
  contact: {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    contactNumber: null,
    lastContactAt: null,
    lastModifiedDate: "",
    company: null,
    owner: { id: 1, firstName: "Alice", lastName: "Smith", authPic: null },
    isDeleted: false
  },
  company: null,
  deal: null,
  isDeleted: false
};

const MOCK_TASKS: CrmTaskType[] = [
  {
    id: 2,
    name: "Send product demo recording",
    type: { id: 2, name: "email", orderIndex: 2 },
    priority: CrmPriorityEnum.MEDIUM,
    isCompleted: false,
    dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: null,
    owner: { id: 1, firstName: "Alice", lastName: "Smith", authPic: null },
    contact: {
      id: 2,
      name: "Sara Lee",
      email: "sara@example.com",
      contactNumber: null,
      lastContactAt: null,
      lastModifiedDate: "",
      company: null,
      owner: { id: 1, firstName: "Alice", lastName: "Smith", authPic: null },
      isDeleted: false
    },
    company: null,
    deal: null,
    isDeleted: false
  },
  {
    id: 3,
    name: "Schedule onboarding meeting",
    type: { id: 3, name: "meeting", orderIndex: 3 },
    priority: CrmPriorityEnum.LOW,
    isCompleted: false,
    dueAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: null,
    owner: { id: 2, firstName: "Bob", lastName: "Jones", authPic: null },
    contact: {
      id: 3,
      name: "Mark Chen",
      email: "mark@example.com",
      contactNumber: null,
      lastContactAt: null,
      lastModifiedDate: "",
      company: null,
      owner: { id: 2, firstName: "Bob", lastName: "Jones", authPic: null },
      isDeleted: false
    },
    company: null,
    deal: null,
    isDeleted: false
  }
];

const TasksTable = () => {
  const translateText = useTranslator("crmModule", "tasks");

  const tabs = useGetTasksTabs();
  const [activeTab, setActiveTab] = useState(tabs[0]?.id);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, TASK_SEARCH_DEBOUNCE_DELAY);
  const emptyStateType =
    debouncedSearch.trim() === ""
      ? EmptyStateTypeEnum.NO_DATA
      : EmptyStateTypeEnum.NO_SEARCH_RESULTS;

  const handleTabChange = (id: string) => {
    setActiveTab(id);
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col pb-1">
        <Tabs
          tabs={tabs}
          activeTabId={activeTab}
          onTabChange={handleTabChange}
        />
        <hr className="border-secondary-accent" />
      </div>
      <InputField
        ariaLabelClearButton={translateText(["table", "clearButtonAriaLabel"])}
        className="w-[25.75rem] h-[3rem]"
        placeholder={translateText(["table", "search"])}
        rightIcon={<SearchIcon />}
        state="default"
        type="search"
        value={searchTerm}
        onChange={handleSearchChange}
        customStyles={{ borderRadius: "rounded-[1.5rem]" }}
      />
      <div className="bg-secondary-background w-full rounded-lg h-[23.25rem]">
        <TaskRow
          task={MOCK_TASK}
          isShowContact={true}
          isCheckTaskVisible={true}
          className="mb-2"
        />

        <SidePanelTasksSection tasks={MOCK_TASKS} isShowContact={true} isCheckTaskVisible={true} />
        {/* <EmptyDataView
          title={
            emptyStateType === EmptyStateTypeEnum.NO_DATA
              ? translateText(["table", "emptyDataState", "title"])
              : translateText(["table", "emptySearchState", "title"])
          }
          description={
            emptyStateType === EmptyStateTypeEnum.NO_DATA
              ? translateText(["table", "emptyDataState", "description"])
              : translateText(["table", "emptySearchState", "description"])
          }
          icon={<SearchIcon />}
        /> */}
      </div>
    </div>
  );
};

export default TasksTable;
