export const COLORS = {
  iconFill: "var(--color-secondary-icon)",
  endIconFill: "var(--color-primary-text)"
};

const styles = {
  row: "flex items-center gap-[12px]",
  linkRow:
    "flex items-center gap-[12px] cursor-pointer hover:opacity-80 transition-opacity",
  iconWrapper: "shrink-0 flex items-center",
  plainText:
    "font-normal text-[14px] leading-[24px] tracking-[0.5px] text-black",
  emptyText:
    "font-normal text-[14px] leading-[24px] tracking-[0.5px] text-primary-text",
  link: "flex items-center gap-[4px]",
  linkText:
    "font-normal text-[14px] leading-[24px] tracking-[0.5px] text-primary-text underline"
};

export default styles;
