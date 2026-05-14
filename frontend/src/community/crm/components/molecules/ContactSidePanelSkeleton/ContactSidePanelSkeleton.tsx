const SkeletonBlock = ({ className = "" }: { className?: string }) => (
  <div className={`rounded bg-[#F5F5F5] ${className}`} />
);

const ContactSidePanelSkeleton = () => {
  const dealRows = [0, 1, 2];
  const taskRows = [0, 1, 2, 3];

  return (
    <div
      className="mx-auto flex w-full min-w-0 flex-col gap-6 overflow-hidden p-2 pb-6 animate-pulse"
      aria-hidden="true"
    >
      {/* Info row: email, phone, company */}
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-5 w-5 rounded" />
          <SkeletonBlock className="h-2.5 w-20" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-5 w-5 rounded" />
          <SkeletonBlock className="h-2.5 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-5 w-5 rounded" />
          <SkeletonBlock className="h-2.5 w-20" />
          <SkeletonBlock className="h-4 w-4 rounded" />
        </div>
      </div>

      <div className="rounded-lg border-2 border-[#D1D5DC] p-3">
        <div className="mb-3 flex items-center gap-2">
          <SkeletonBlock className="h-4 w-4" />
          <SkeletonBlock className="h-3 w-24" />
        </div>
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="h-3 w-full" />
          <SkeletonBlock className="h-3 w-full" />
          <SkeletonBlock className="h-3 w-3/5" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {["w-20", "w-28", "w-24", "w-16"].map((widthClass) => (
          <div
            className="rounded-lg border border-[#D1D5DC] p-3"
            key={widthClass}
          >
            <SkeletonBlock className={`h-3 ${widthClass}`} />
            <SkeletonBlock className="mt-2 h-3 w-14" />
          </div>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-4 w-16" />
          <SkeletonBlock className="h-9 w-28 rounded-lg" />
        </div>
        <SkeletonBlock className="h-px w-full" />
        <div className="flex flex-col gap-4">
          {dealRows.map((row) => (
            <div
              className="rounded-lg border border-[#E5E7EB] p-3"
              key={`deal-${row}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <SkeletonBlock className="h-3 w-40" />
                  <div className="flex items-center gap-2">
                    <SkeletonBlock className="h-2 w-16" />
                    <SkeletonBlock className="h-1 w-1 rounded-full" />
                    <SkeletonBlock className="h-2 w-12" />
                  </div>
                </div>
                <SkeletonBlock className="h-8 w-28 rounded-full" />
              </div>
              {row === 1 && (
                <div className="mt-4 flex flex-col gap-2">
                  <SkeletonBlock className="h-2 w-3/5" />
                  <SkeletonBlock className="h-2 w-full" />
                  <SkeletonBlock className="h-2 w-3/5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SkeletonBlock className="h-4 w-16" />
        <SkeletonBlock className="h-px w-full" />
        <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
          {taskRows.map((row) => (
            <div
              className="flex items-center justify-between gap-4 border-b border-[#E5E7EB] p-3 last:border-b-0"
              key={`task-${row}`}
            >
              <div className="flex items-center gap-3">
                <SkeletonBlock className="h-6 w-6 rounded-full" />
                <SkeletonBlock className="h-5 w-5 rounded-full" />
                <div className="flex flex-col gap-2">
                  <SkeletonBlock className="h-3 w-28" />
                  <SkeletonBlock className="h-2 w-20" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <SkeletonBlock className="h-8 w-12 rounded-full" />
                <SkeletonBlock className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ContactSidePanelSkeleton;
