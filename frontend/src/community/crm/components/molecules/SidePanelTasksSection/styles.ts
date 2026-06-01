const styles = {
  wrapper: "flex flex-col gap-3",
  header: "flex items-center justify-between",
  title: "text-[20px] font-bold leading-[24px] tracking-[-0.4492px] text-black",
  divider: "border-t border-[#e5e7eb]",
  skeletonList: "flex flex-col gap-0.5",
  taskSection: "flex flex-col items-start w-full",
  taskList:
    "border border-gray-200 rounded-[8px] divide-y divide-gray-200 w-full",
  emptyWrapper:
    "bg-[#f9fafb] flex flex-col gap-[12px] h-[228px] items-center justify-center rounded-[8px] w-full",
  emptyDataViewWrapper: "!h-auto !p-0",
  emptyTitle:
    "!font-bold !text-[18px] !leading-[24px] !tracking-[-0.4395px] !text-black",
  emptyDesc: "!font-normal !text-[14px] !text-black",
  emptyAddTaskBtn:
    "bg-gray-100 border border-gray-200 rounded-[8px] px-[20px] py-[8px] flex gap-[8px] items-center justify-center font-medium text-[12px] text-black cursor-pointer hover:bg-gray-200 transition-colors",
  addTaskBtn:
    "flex gap-[8px] items-center px-[6px] py-[4px] rounded-[8px] font-medium text-[12px] text-black cursor-pointer hover:bg-[#f4f4f5] transition-colors"
};

export default styles;
