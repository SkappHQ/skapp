const styles = {
  wrapper: "flex flex-col gap-3",
  header: "flex items-center justify-between",

  title: "text-[20px] font-bold leading-[24px] tracking-[-0.4492px] text-black",
  divider: "border-t border-[#e5e7eb]",
  skeletonList: "flex flex-col gap-0.5",

  taskSection: "flex flex-col gap-[8px] items-start w-full",
  taskList: "border border-[#e5e7eb] rounded-[8px] overflow-hidden w-full",
  taskRowBorder: "border-b border-[#e5e7eb]",

  taskRow: "flex items-center gap-4 p-3 min-w-0 min-h-[63px]",
  typeIconCircle:
    "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
  taskContent: "flex-1 min-w-0",
  taskName: "text-sm text-black leading-snug truncate",
  taskNameCompleted:
    "text-sm text-[#9ca3af] line-through leading-snug truncate",
  taskDueDateBase: "text-xs leading-none mt-0.5",

  taskActions: "flex items-center gap-6 shrink-0",

  emptyWrapper:
    "bg-[#f9fafb] flex flex-col gap-[12px] h-[228px] items-center justify-center rounded-[8px] w-full",

  emptyDataViewWrapper: "!h-auto !p-0",

  emptyTitle:
    "!font-bold !text-[18px] !leading-[24px] !tracking-[-0.4395px] !text-black",

  emptyDesc: "!font-normal !text-[14px] !text-black",

  emptyAddTaskBtn:
    "bg-[#f4f4f5] border border-[#e4e4e7] rounded-[8px] px-[20px] py-[8px] flex gap-[8px] items-center justify-center font-medium text-[12px] text-black cursor-pointer hover:bg-[#ebebeb] transition-colors",

  addTaskBtn:
    "flex gap-[8px] items-center px-[6px] py-[4px] rounded-[8px] font-medium text-[12px] text-black cursor-pointer hover:bg-[#f4f4f5] transition-colors"
};

export default styles;
