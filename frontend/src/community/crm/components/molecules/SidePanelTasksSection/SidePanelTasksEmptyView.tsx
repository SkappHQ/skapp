import { ButtonV2, EmptyDataView, PlusIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import SearchIcon from "~community/common/assets/Icons/SearchIcon";
import { useTranslator } from "~community/common/hooks/useTranslator";

interface Props {
  onAddTask: () => void;
}

const SidePanelTasksEmptyView: FC<Props> = ({ onAddTask }) => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel",
    "tasks"
  );

  return (
    <div className="bg-secondary-background flex flex-col h-[228px] items-center justify-center rounded-lg w-full">
      <EmptyDataView
        icon={<SearchIcon width="24" height="24" />}
        title={translateText(["emptyTitle"])}
        description={translateText(["emptyDescription"])}
        className={{
          wrapper: "h-auto",
          title: "leading-[24px] tracking-[-0.4395px] text-black",
          description: "text-black"
        }}
      />
      <ButtonV2
        type="button"
        variant="tertiary"
        size="sm"
        icon={<PlusIcon />}
        iconPosition="end"
        onClick={onAddTask}
      >
        {translateText(["addTaskButtonEmptyView"])}
      </ButtonV2>
    </div>
  );
};

export default SidePanelTasksEmptyView;
