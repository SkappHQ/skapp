const DraggableDealStageCardSkeleton = () => {
  return (
    <div className="flex w-full animate-pulse flex-col gap-[18px]">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex h-[60px] w-full flex-row items-center gap-[18px]"
        >
          <div className="h-[24px] w-[24px] rounded-[8px] bg-secondary-accent"></div>
          <div className="h-[60px] w-full rounded-[8px] bg-secondary-accent"></div>
        </div>
      ))}
    </div>
  );
};

export default DraggableDealStageCardSkeleton;
