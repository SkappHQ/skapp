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
import TaskRow from "~community/crm/components/molecules/TaskRow/TaskRow";
import { useCrmStore } from "~community/crm/store/store";
import { CrmTaskType } from "~community/crm/types/CommonTypes";

const TasksTable = () => {
  const translateText = useTranslator("crmModule", "tasks");
  const { setSelectedTask, setIsCrmSidePanelOpen } = useCrmStore((store) => ({
    setSelectedTask: store.setSelectedTask,
    setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen
  }));

  const dummyTasks: CrmTaskType[] = [
    {
      id: 101,
      name: "Follow up with Jane Smith",
      type: { id: 1, name: "Call", orderIndex: 0 },
      priority: CrmPriorityEnum.HIGH,
      isCompleted: false,
      dueAt: "2026-06-20T10:00:00",
      notes: "Discuss pricing and onboarding timeline.",
      owner: { employeeId: 1, firstName: "John", lastName: "Doe", authPic: null },
      contact: {
        id: 1,
        name: "Jane Smith",
        email: "jane.smith@example.com",
        contactNumber: null,
        lastContactAt: null,
        lastModifiedDate: "2026-06-18T10:00:00",
        company: null,
        owner: { employeeId: 1, firstName: "John", lastName: "Doe", authPic: null },
        isDeleted: false
      },
      company: null,
      deal: {
        id: 201,
        name: "Enterprise License Deal",
        description: null,
        stage: {
          id: 1,
          name: "Negotiation",
          color: "#2563EB",
          orderIndex: 1,
          stageType: "OPEN"
        },
        priority: CrmPriorityEnum.HIGH,
        closingAt: null,
        amount: "25000",
        currencyCode: "USD",
        company: null,
        contact: {
          id: 1,
          name: "Jane Smith",
          email: "jane.smith@example.com",
          contactNumber: null,
          lastContactAt: null,
          lastModifiedDate: "2026-06-18T10:00:00",
          company: null,
          owner: { employeeId: 1, firstName: "John", lastName: "Doe", authPic: null },
          isDeleted: false
        },
        owner: { employeeId: 1, firstName: "John", lastName: "Doe", authPic: null },
        isDeleted: false
      },
      isDeleted: false
    },
    {
      id: 102,
      name: "Prepare proposal draft",
      type: { id: 4, name: "Other", orderIndex: 3 },
      priority: CrmPriorityEnum.MEDIUM,
      isCompleted: false,
      dueAt: "2026-06-22T15:00:00",
      notes: "Include implementation plan and discount options.",
      owner: { employeeId: 1, firstName: "John", lastName: "Doe", authPic: null },
      contact: null,
      company: null,
      deal: null,
      isDeleted: false
    },
    {
      id: 103,
      name: "Send meeting minutes",
      type: { id: 2, name: "Email", orderIndex: 1 },
      priority: CrmPriorityEnum.LOW,
      isCompleted: true,
      dueAt: "2026-06-18T12:00:00",
      notes: "Share recap with stakeholders.",
      owner: { employeeId: 2, firstName: "Alex", lastName: "Perera", authPic: null },
      contact: null,
      company: null,
      deal: null,
      isDeleted: false
    }
  ];

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

  const tasksByTab: Record<string, CrmTaskType[]> = {
    "my-tasks": dummyTasks.filter((task) => task.owner.employeeId === 1 && !task.isCompleted),
    "team-tasks": dummyTasks.filter((task) => task.owner.employeeId !== 1 && !task.isCompleted),
    "completed-tasks": dummyTasks.filter((task) => task.isCompleted)
  };

  const filteredTasks = (tasksByTab[activeTab] ?? []).filter((task) =>
    task.name.toLowerCase().includes(debouncedSearch.trim().toLowerCase())
  );

  const handleTaskRowClick = (task: CrmTaskType) => {
    setSelectedTask(task);
    setIsCrmSidePanelOpen(true);
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
      <div className="bg-secondary-background w-full rounded-lg h-[23.25rem] overflow-y-auto p-2">
        {filteredTasks.length === 0 ? (
          <EmptyDataView
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
          />
        ) : (
          <div className="flex flex-col gap-2">
            {filteredTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                isShowContact={activeTab !== "team-tasks"}
                onRowClick={() => handleTaskRowClick(task)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksTable;
