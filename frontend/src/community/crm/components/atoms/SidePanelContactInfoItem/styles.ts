export const COLORS = {
  iconFill: "var(--color-secondary-icon)",
  endIconFill: "currentColor"
};

const styles = {
  row: "flex items-center gap-[12px]",
  iconWrapper: "shrink-0 flex items-center",
  plainText:
    "font-normal text-[14px] leading-[24px] tracking-[0.5px] text-black",
  emptyText:
    "font-normal text-[14px] leading-[24px] tracking-[0.5px] text-primary-text",
  linkBtn:
    "group !cursor-pointer !p-0 !min-w-0 !justify-start !h-auto !rounded-[4px] hover:!bg-transparent focus:!outline-none focus-visible:!ring-2 focus-visible:!ring-[var(--color-primary-accent)] focus-visible:!ring-offset-2",
  link: "flex items-center gap-[4px] transition-colors text-primary-text cursor-pointer group-hover:text-[var(--color-primary-accent)]",
  linkText: "font-normal text-[14px] leading-[24px] tracking-[0.5px] underline"
};

export default styles;
