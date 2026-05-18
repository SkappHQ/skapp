const styles = {
  // no container div — trigger is the root element, dropdown is position:fixed
  trigger:
    "flex items-center gap-0.5 cursor-pointer bg-transparent border-none outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] rounded-[4px] p-0",
  iconCircle: "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
  // position + top/left are set inline (fixed positioning via getBoundingClientRect)
  dropdown:
    "z-[9999] bg-white border border-[#e5e7eb] rounded-[8px] shadow-md overflow-hidden min-w-[148px]",
  option:
    "flex items-center gap-2.5 w-full px-3 py-2 cursor-pointer hover:bg-[#f4f4f5] transition-colors text-left",
  optionIcon: "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
  optionLabel: "text-sm text-[#374151]"
};

export default styles;
