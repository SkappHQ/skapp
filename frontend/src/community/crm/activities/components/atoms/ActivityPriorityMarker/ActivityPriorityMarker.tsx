import { HighPriorityIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";

const ActivityPriorityMarker: FC = () => {
  const translateAria = useTranslator("crmAria");

  return (
    <span
      role="img"
      aria-label={translateAria(["activities", "row", "highPriority"])}
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-semantic-red-background text-semantic-amber-text"
    >
      <HighPriorityIcon size={16} />
    </span>
  );
};

export default ActivityPriorityMarker;
