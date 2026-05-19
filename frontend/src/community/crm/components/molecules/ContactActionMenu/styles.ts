const styles = {
  wrapper: "relative",
  trigger:
    "!rounded-full !p-0 !min-w-0 !outline-none w-9 h-9 bg-secondary-accent hover:bg-[#d4d4d8] transition-colors",
  dropdown:
    "absolute right-0 top-full mt-1 z-10 w-[227px] bg-white rounded-[12px] overflow-hidden shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.10),_0px_20px_25px_-5px_rgba(0,0,0,0.10)]",

  editItem:
    "!justify-start !rounded-none !h-[48px] !px-3 !min-w-0 !text-sm !text-black !bg-transparent !border-0 hover:!bg-[#F3F4F6] active:!bg-[#e8e8e8] !outline-none tracking-[0.3px]",
  deleteItem:
    "!justify-start !rounded-none !h-[48px] !px-3 !min-w-0 !text-sm !text-[#82181a] !bg-transparent !border-0 hover:!bg-[#FFE2E2] active:!bg-[#ffd0d0] !outline-none tracking-[0.3px]",
  triggerIconFill: "#374151",
  editIconFill: "#000000",
  deleteIconFill: "#82181a"
};

export default styles;
