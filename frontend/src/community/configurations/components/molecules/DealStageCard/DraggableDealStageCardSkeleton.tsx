const IndividualStatusCardSkeleton = () => {
  return (
    <div className="h-[60px] flex flex-row gap-[18px] w-full items-center">
      <div className="h-[24px] w-[24px] bg-gray-200 rounded-[8px]"></div>
      <div className="h-[60px] w-full bg-gray-200 rounded-[8px]"></div>
    </div>
  );
};

const DraggableStatusCardSkeleton = () => {
  return (
    <div className="animate-pulse flex flex-col gap-[18px] w-full">
      {Array.from({ length: 3 }).map((_, idx) => (
        <IndividualStatusCardSkeleton key={idx} />
      ))}
    </div>
  );
};

export default DraggableStatusCardSkeleton;
