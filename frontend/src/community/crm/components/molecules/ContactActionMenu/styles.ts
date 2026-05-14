const styles = {
  wrapper: "relative",
  // ButtonV2 overrides: remove default padding/min-w/radius/outline; keep circular shape
  trigger:
    "!rounded-full !p-0 !min-w-0 !outline-none w-8 h-8 bg-secondary-accent hover:bg-[#d4d4d8] transition-colors",
  dropdown:
    "absolute right-0 top-full mt-1 z-10 bg-white border-[0.8px] border-[#f3f4f6] rounded-[10px] shadow-[0px_8px_16px_rgba(0,0,0,0.12)] min-w-[160px] overflow-hidden",
  // ButtonV2 overrides: left-align, custom padding, no radius, correct text size
  editItem:
    "!justify-start !rounded-none !px-2.5 !py-2 !min-w-0 !text-sm text-black tracking-[0.3px] hover:!bg-tertiary-background active:!bg-[#e8e8e8] !outline-none",
  deleteItem:
    "!justify-start !rounded-[10px] !px-2.5 !py-2 !min-w-0 !text-sm !text-[#82181a] !bg-[#ffe2e2] hover:!bg-[#ffd0d0] active:!bg-[#ffbdbd] !outline-none tracking-[0.3px]",
  triggerIconFill: "#374151",
  editIconFill: "#374151"
};

export default styles;
