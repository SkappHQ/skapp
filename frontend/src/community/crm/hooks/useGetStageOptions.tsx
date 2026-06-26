import { useMemo } from "react";

import { STAGE_COLOR_MAP } from "~community/crm/constants/stageConstants";
import useGetMappedDealStages from "~community/crm/hooks/useGetMappedDealStages";

const useGetStageOptions = () => {
  const { dealStages, initialStageId, isLoading: isStagesLoading, isError: isStagesError } =
    useGetMappedDealStages();

  const stageOptions = useMemo(
    () =>
      dealStages.map((s) => ({
        id: String(s.id),
        value: String(s.id),
        label: (
          <div className="inline-flex items-center gap-2.5">
            <div
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: STAGE_COLOR_MAP[s.color] }}
            />
            <span className="body2">{s.name}</span>
          </div>
        )
      })),
    [dealStages]
  );

  return { stageOptions, isStagesLoading, isStagesError, initialStageId };
};

export default useGetStageOptions;
