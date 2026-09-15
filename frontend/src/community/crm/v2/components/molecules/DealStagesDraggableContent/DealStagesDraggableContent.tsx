import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";

import { useTranslator } from "~community/common/hooks/useTranslator";
import DraggableDealStageCard from "~community/crm/v2/components/molecules/DraggableDealStageCard/DraggableDealStageCard";
import { CrmDealStageEnum } from "~community/crm/v2/enums/common";
import { CrmStageEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { toStageIds } from "~community/crm/v2/utils/stageUtil";

interface DealStagesDraggableContentProps {
  stagesData: CrmStageEntity[];
  onStagesReorder: (stages: CrmStageEntity[]) => void;
  onEdit: (stage: CrmStageEntity) => void;
  onDelete: (stage: CrmStageEntity) => void;
}

const DealStagesDraggableContent = ({
  stagesData,
  onStagesReorder,
  onEdit,
  onDelete
}: DealStagesDraggableContentProps) => {
  const translateText = useTranslator("configurations", "crm");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const isTerminalStage = (stageType?: CrmDealStageEnum) =>
    stageType === CrmDealStageEnum.WON || stageType === CrmDealStageEnum.LOST;

  const initialStages = stagesData.filter(
    (stage) => stage.stageType === CrmDealStageEnum.INITIAL
  );

  const draggableStages = stagesData.filter(
    (stage) =>
      !isTerminalStage(stage.stageType) &&
      stage.stageType !== CrmDealStageEnum.INITIAL
  );

  const activeStages = [...initialStages, ...draggableStages];

  const terminalStages = stagesData.filter((stage) =>
    isTerminalStage(stage.stageType)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = draggableStages.findIndex(
      (stage) => stage.id === active.id
    );
    const newIndex = draggableStages.findIndex((stage) => stage.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(draggableStages, oldIndex, newIndex);

    onStagesReorder([...initialStages, ...reordered, ...terminalStages]);
  };

  return (
    <div className="w-full flex flex-col gap-8">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={toStageIds(draggableStages)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex flex-col gap-4">
            {activeStages.map(
              (stage) =>
                stage.id !== undefined && (
                  <DraggableDealStageCard
                    key={stage.id}
                    stage={stage}
                    stageId={stage.id}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    isTerminalStage={isTerminalStage(stage.stageType)}
                    isDeletable={stage.stageType === CrmDealStageEnum.OPEN}
                    isDraggable={stage.stageType === CrmDealStageEnum.OPEN}
                  />
                )
            )}
          </ul>
        </SortableContext>
      </DndContext>
      <hr className="w-full border-t border-secondary-accent" />
      <div className="flex flex-col gap-2">
        <p className="body1 text-secondary-text mb-3">
          {translateText(["dealsSection", "dealCompleteStateNote"])}
        </p>
        <ul className="flex flex-col gap-4">
          {terminalStages.map(
            (stage) =>
              stage.id !== undefined && (
                <DraggableDealStageCard
                  key={stage.id}
                  stage={stage}
                  stageId={stage.id}
                  onEdit={onEdit}
                  isTerminalStage={isTerminalStage(stage.stageType)}
                  isDraggable={false}
                />
              )
          )}
        </ul>
      </div>
    </div>
  );
};

export default DealStagesDraggableContent;
