const DraggableDealStageCardSkeletonItem = () => {
  return (
    <div className="h-[60px] flex flex-row gap-[18px] w-full items-center">
      <div className="h-[24px] w-[24px] bg-secondary-accent rounded-[8px]"></div>
      <div className="h-[60px] w-full bg-secondary-accent rounded-[8px]"></div>
    </div>
  );
};

const DraggableDealStageCardSkeleton = () => {
  return (
    <div className="animate-pulse flex flex-col gap-[18px] w-full">
      <DraggableDealStageCardSkeletonItem/>
      <DraggableDealStageCardSkeletonItem/>
      <DraggableDealStageCardSkeletonItem/>
    </div>
  );
};

export default DraggableDealStageCardSkeleton;
