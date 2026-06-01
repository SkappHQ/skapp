const styles = {
  row: "flex items-center gap-4 p-3 min-w-0 min-h-[63px] bg-white [&:first-child]:rounded-t-[8px] [&:last-child]:rounded-b-[8px]",
  rowLastBeforeForm: "rounded-b-none!",
  rowClickable: "cursor-pointer hover:bg-gray-50",
  typeIcon: "shrink-0 flex items-center justify-center",
  content: "flex-1 min-w-0",
  name: "text-sm text-black leading-snug truncate",
  nameCompleted: "text-sm text-black line-through leading-snug truncate",
  dueDateBase: "text-xs leading-none mt-0.5",
  dueDateCompleted: "text-xs leading-none mt-0.5 line-through text-gray-600",
  actions: "flex items-center gap-6 shrink-0",
  priorityIcon: "w-8! h-8!"
};

export default styles;
