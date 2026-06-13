import { FC } from "react";

import { CrmTaskDetailType } from "~community/crm/types/CommonTypes";
import {
  isDueToday,
  isDueTomorrow,
  isOverdue
} from "~community/crm/utils/taskValidations";

const groupTasksByDueDate = (tasks: CrmTaskDetailType[]) => {
  const overdue: CrmTaskDetailType[] = [];
  const dueToday: CrmTaskDetailType[] = [];
  const dueTomorrow: CrmTaskDetailType[] = [];
  const upcoming: CrmTaskDetailType[] = [];

  for (const task of tasks) {
    if (!task.dueAt) {
      upcoming.push(task);
    } else if (isOverdue(task.dueAt)) {
      overdue.push(task);
    } else if (isDueToday(task.dueAt)) {
      dueToday.push(task);
    } else if (isDueTomorrow(task.dueAt)) {
      dueTomorrow.push(task);
    } else {
      upcoming.push(task);
    }
  }

  return { overdue, dueToday, dueTomorrow, upcoming };
};

const TaskRow: FC<{ task: CrmTaskDetailType }> = ({ task }) => { // TODO: Replace with actual task row component
  return <div className="py-2">{task.name}</div>;
};

const MyTasksTabContent: FC<{ tasks: CrmTaskDetailType[] }> = ({ tasks }) => {
  const { overdue, dueToday, dueTomorrow, upcoming } =
    groupTasksByDueDate(tasks);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-secondary-text">Overdue</div>
      <div>
        {overdue.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </div>
      <div className="text-secondary-text">Due today</div>
      <div>
        {dueToday.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </div>
      <div className="text-secondary-text">Due tomorrow</div>
      <div>
        {dueTomorrow.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </div>
      <div className="text-secondary-text">Upcoming</div>
      <div>
        {upcoming.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default MyTasksTabContent;
