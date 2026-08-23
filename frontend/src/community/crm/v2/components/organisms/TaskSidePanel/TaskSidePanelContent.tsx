import { FC, useEffect, useMemo } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { TASK_PAGE_SIZE } from "~community/crm/constants/taskConstants";
import { useGetCompaniesByIds } from "~community/crm/v2/api/CompanyApi";
import { useGetDealsByIds } from "~community/crm/v2/api/DealApi";
import {
  useGetRelatedTasks,
  useGetTaskById,
  useUpdateTask
} from "~community/crm/v2/api/TaskApi";
import SidePanelTaskDeal from "~community/crm/v2/components/molecules/SidePanelTaskDeal/SidePanelTaskDeal";
import SidePanelTaskInfo from "~community/crm/v2/components/molecules/SidePanelTaskInfo/SidePanelTaskInfo";
import SidePanelTasksSection from "~community/crm/v2/components/molecules/SidePanelTasksSection/SidePanelTasksSection";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  collectMissingTaskCompanyIds,
  collectMissingTaskDealIds,
  mergeCompaniesRecord,
  mergeDealsRecord,
  mergeTasksRecord,
  toCompaniesRecord,
  toDealsRecord,
  toTasksRecord
} from "~community/crm/v2/utils/crmEntityUtils";

interface Props {
  taskId: number;
  onClose: () => void;
}

const TaskSidePanelContent: FC<Props> = ({ taskId, onClose }) => {
  const translateText = useTranslator("crmModule", "tasks");

  const { setToastMessage } = useToast();

  const { tasks, deals, companies, setTasks, setDeals, setCompanies } =
    useCrmStoreV2((state) => ({
      tasks: state.tasks,
      deals: state.deals,
      companies: state.companies,
      setTasks: state.setTasks,
      setDeals: state.setDeals,
      setCompanies: state.setCompanies
    }));

  const task = tasks[taskId];

  const { data: taskData } = useGetTaskById(taskId, true);

  const responseTasks = useMemo(() => (taskData ? [taskData] : []), [taskData]);

  const dealIds = useMemo(
    () => collectMissingTaskDealIds(responseTasks, deals),
    [responseTasks, deals]
  );
  const companyIds = useMemo(
    () => collectMissingTaskCompanyIds(responseTasks, companies),
    [responseTasks, companies]
  );

  const { data: dealsData } = useGetDealsByIds(dealIds, dealIds.length > 0);
  const { data: companiesData } = useGetCompaniesByIds(
    companyIds,
    companyIds.length > 0
  );

  useEffect(() => {
    if (responseTasks.length > 0) {
      setTasks(mergeTasksRecord(tasks, toTasksRecord(responseTasks)));
    }

    if (dealsData) {
      setDeals(mergeDealsRecord(deals, toDealsRecord(dealsData)));
    }

    if (companiesData) {
      setCompanies(
        mergeCompaniesRecord(companies, toCompaniesRecord(companiesData))
      );
    }
  }, [
    responseTasks,
    dealsData,
    companiesData,
    tasks,
    deals,
    companies,
    setTasks,
    setDeals,
    setCompanies
  ]);

  const { mutate: updateTaskCompletion } = useUpdateTask();

  const {
    data: relatedTasksData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetRelatedTasks({ id: taskId, size: TASK_PAGE_SIZE }, true);

  const relatedTaskIds = (
    relatedTasksData?.pages.flatMap((page) => page.items) ?? []
  )
    .filter((relatedTask) => relatedTask.id !== taskId)
    .map((relatedTask) => relatedTask.id)
    .filter((id): id is number => id !== undefined);

  const handleMarkAsDone = () => {
    updateTaskCompletion(
      { id: taskId, isCompleted: true },
      {
        onSuccess: (updatedTask) => {
          setTasks(mergeTasksRecord(tasks, toTasksRecord([updatedTask])));
          onClose();
        },
        onError: () =>
          setToastMessage({
            open: true,
            toastType: ToastType.ERROR,
            title: translateText(["toggleErrorTitle"]),
            description: translateText(["toggleErrorDescription"])
          })
      }
    );
  };

  if (!task) return null;

  return (
    <div className="flex flex-col pb-4 gap-4">
      <div className="flex gap-6 pb-4">
        <div className="flex flex-col flex-1 gap-6 min-w-0">
          <div className="flex flex-col gap-1">
            <p className="subtitle1">{translateText(["sidePanel", "notes"])}</p>
            <p className="subtitle3">
              {task.notes ?? translateText(["sidePanel", "noNotes"])}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="h2">{translateText(["sidePanel", "dealsTitle"])}</h2>
            <hr className="border-secondary-accent" />
            <SidePanelTaskDeal dealId={task.dealId} />
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="h2">
              {translateText(["sidePanel", "relatedTasksTitle"])}
            </h2>
            <hr className="border-secondary-accent" />
            <SidePanelTasksSection
              taskIds={relatedTaskIds}
              isShowContact={true}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onFetchNextPage={fetchNextPage}
              showAddTaskAction={false}
              emptyDescription={translateText([
                "sidePanel",
                "noRelatedTasksDescription"
              ])}
            />
          </div>
        </div>

        <div className="w-[18.438rem] shrink-0">
          <SidePanelTaskInfo task={task} onMarkAsDone={handleMarkAsDone} />
        </div>
      </div>
    </div>
  );
};

export default TaskSidePanelContent;
