import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DragIcon, StatusCard } from "@rootcodelabs/skapp-ui";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";
import { STAGE_COLOR_MAP } from "~community/crm/constants/stageConstants";
import { CrmDealStageType } from "~community/crm/types/CommonTypes";

interface DraggableDealStageCardProps {
  stage: CrmDealStageType;
  onEdit: (stage: CrmDealStageType) => void;
  onDelete?: (stage: CrmDealStageType) => void;
  isTerminalStage: boolean;
}

const DraggableDealStageCard = ({
  stage,
  onEdit,
  onDelete,
  isTerminalStage
}: DraggableDealStageCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: stage.id, disabled: isTerminalStage });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="w-full flex flex-row justify-between"
    >
      {!isTerminalStage ? (
        <div
          {...listeners}
          {...attributes}
          className="cursor-grab"
          role="button"
        >
          <DragIcon />
        </div>
      ) : (
        <div className="w-6 h-6 flex-shrink-0" aria-hidden="true" />
      )}
      <StatusCard
        id={stage.id.toString()}
        color={{
          label: stage.color,
          code: STAGE_COLOR_MAP[stage.color]
        }}
        title={stage.name}
        description={stage.description ?? ""}
        className={{
          title: "body-2 text-xs w-full md:!w-1/5 flex-shrink-0",
          description: "text-secondary text-xs"
        }}
        iconButtons={{
          edit: {
            icon: <Icon name={IconName.EDIT_ICON} />,
            onClick: () => onEdit(stage),
            "aria-label": `Edit stage "${stage.name}"`
          },
          ...(!isTerminalStage &&
            onDelete && {
              delete: {
                icon: <Icon name={IconName.DELETE_BUTTON_ICON} />,
                onClick: () => onDelete(stage),
                "aria-label": `Delete stage "${stage.name}"`
              }
            })
        }}
      />
    </li>
  );
};

export default DraggableDealStageCard;
