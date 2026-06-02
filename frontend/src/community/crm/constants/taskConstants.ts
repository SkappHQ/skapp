export const getTasksPageTabs = (translateText: (keys: string[]) => string) => [
  { id: "my-tasks", label: translateText(["tabs", "myTasks"]) },
  { id: "team-tasks", label: translateText(["tabs", "teamTasks"]) },
  { id: "completed", label: translateText(["tabs", "completed"]) }
];