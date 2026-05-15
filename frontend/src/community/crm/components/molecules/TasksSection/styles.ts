const styles = {
  wrapper: "flex flex-col gap-4",
  header: "flex items-center justify-between",
  title: "text-[1.125rem] font-bold text-black",
  divider: "border-t border-[#e5e7eb]",
  skeletonList: "flex flex-col gap-0.5",
  taskList: "border border-[#e5e7eb] rounded-[8px] overflow-hidden",
  taskRowBorder: "border-b border-[#e5e7eb]",
  taskRow: "flex items-center gap-3 px-3 py-3 min-w-0",
  typeIconCircle:
    "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
  taskContent: "flex-1 min-w-0",
  taskName: "text-sm text-black leading-snug truncate",
  taskNameCompleted:
    "text-sm text-[#9ca3af] line-through leading-snug truncate",
  taskDueDateBase: "text-xs leading-none mt-0.5",
  // Due date color classes — listed here for Tailwind to scan
  dueDateOverdue: "text-[#82181a]",
  dueDateToday: "text-[#D97706]",
  dueDateDefault: "text-[#6B7280]",
  dueDateNone: "text-[#9ca3af]",
  // Priority badge bg classes — listed here for Tailwind to scan
  priorityHigh: "bg-[#FFD6D9]",
  priorityMedium: "bg-[#FFF3C1]",
  priorityLow: "bg-[#D8F999]",
  taskActions: "flex items-center gap-2 shrink-0",
  emptyWrapper:
    "bg-[#f9fafb] flex flex-col gap-3 h-[228px] items-center justify-center rounded-[8px] w-full"
};

export default styles;