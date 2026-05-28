const styles = {
  wrapper: "flex flex-col gap-4 mt-6",
  title: "h2",
  divider: "border-secondary-accent",

  skeletonList: "flex flex-col gap-4",
  skeletonItem: "h-[52px] w-full animate-pulse rounded-lg bg-tertiary-background",

  emptyWrapper: "h-[228px]",

  dealHeader: "flex flex-col gap-[2px]",
  dealName: "body2",
  dealMeta: "flex items-center gap-2 text-secondary-text",
  dealSeparator: "inline-block h-1 w-1 rounded-full bg-secondary-icon",

  badgeWrapper:
    "flex items-center justify-center gap-2 rounded-full bg-tertiary-background px-3 py-1.5",
  badgeDot: "inline-block h-2 w-2 rounded-full",
  badgeText: "body2 text-secondary-text",

  contentWrapper: "flex flex-col gap-1",
  contentLabel: "subtitle4 text-secondary-text",
  contentText: "body3",

  accordionWrapper: "gap-4",
  addDealBtn: "self-start !px-3",
  dealsList: "flex flex-col"
};

export default styles;
