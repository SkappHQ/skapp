import { HighPriorityIcon, PriorityIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";

const ActivityPriorityMarker: FC = () => {
  const translateAria = useTranslator("crmAria");

  return (
    <PriorityIcon
      icon={<HighPriorityIcon />}
      bgColor="bg-semantic-red-background"
      ariaLabel={translateAria(["activities", "row", "highPriority"])}
    />
  );
};

export default ActivityPriorityMarker;
