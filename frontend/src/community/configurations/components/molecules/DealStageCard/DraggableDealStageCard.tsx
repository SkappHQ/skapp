import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DragIcon, StatusCard } from "@rootcodelabs/skapp-ui";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { DEFAULT_STAGE_NAME_MAP, STAGE_COLOR_MAP } from "~community/crm/constants/stageConstants";
import { CrmDealStageType } from "~community/crm/types/CommonTypes";

interface DraggableDealStageCardProps {
  stage: CrmDealStageType;
  onEdit: (stage: CrmDealStageType) => void;
  onDelete?: (stage: CrmDealStageType) => void;
  isTerminalStage: boolean;
  isDeletable?: boolean;
}

const DraggableDealStageCard = ({
  stage,
  onEdit,
  onDelete,
  isTerminalStage,
  isDeletable = false
}: DraggableDealStageCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: stage.id, disabled: isTerminalStage });
  const translateText = useTranslator("configurations", "crm");

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
      {isTerminalStage ? (
        <div className="w-6 h-6 flex-shrink-0" aria-hidden="true" />
      ) : (
        <button
          {...listeners}
          {...attributes}
          className="cursor-grab"
          type="button"
        >
          <DragIcon />
        </button>
      )}
      <StatusCard
        id={stage.id.toString()}
        color={{
          label: stage.color,
          code: STAGE_COLOR_MAP[stage.color]
        }}
        title={DEFAULT_STAGE_NAME_MAP[stage.name] ?? stage.name}
        description={stage.description ?? ""}
        className={{
          title: "body1 md:!w-[23%] flex-shrink-0",
          description: "body2 flex-1"
        }}
        iconButtons={{
          edit: {
            icon: <Icon name={IconName.EDIT_ICON} />,
            onClick: () => onEdit(stage),
            "aria-label": translateText(["aria", "editStage"], {
              stageName: stage.name
            })
          },
          ...(!isTerminalStage &&
            isDeletable &&
            onDelete && {
              delete: {
                icon: <Icon name={IconName.DELETE_BUTTON_ICON} />,
                onClick: () => onDelete(stage),
                "aria-label": translateText(["aria", "deleteStage"], {
                  stageName: stage.name
                })
              }
            })
        }}
      />
    </li>
  );
};

export default DraggableDealStageCard;
