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
import DraggableDealStageCard from "~community/configurations/components/molecules/DealStageCard/DraggableDealStageCard";
import { CrmDealStageEnum } from "~community/crm/enums/common";
import { CrmDealStageType } from "~community/crm/types/CommonTypes";

interface DealStagesDraggableContentProps {
  stagesData: CrmDealStageType[];
  onStagesReorder: (stages: CrmDealStageType[]) => void;
  onEdit: (stage: CrmDealStageType) => void;
  onDelete: (stage: CrmDealStageType) => void;
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

  const isTerminalStage = (stageType: CrmDealStageEnum) =>
    [CrmDealStageEnum.WON, CrmDealStageEnum.LOST].includes(stageType);

  const activeStages = stagesData.filter(
    (stage) => !isTerminalStage(stage.stageType)
  );

  const terminalStages = stagesData.filter((stage) =>
    isTerminalStage(stage.stageType)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = activeStages.findIndex((stage) => stage.id === active.id);
    const newIndex = activeStages.findIndex((stage) => stage.id === over.id);

    const reordered = arrayMove(activeStages, oldIndex, newIndex).map(
      (stage, index) => ({ ...stage, orderIndex: index + 1 })
    );

    onStagesReorder([...reordered, ...terminalStages]);
  };

  return (
    <div className="w-full flex flex-col gap-8">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={activeStages.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex flex-col gap-4">
            {activeStages.map((stage) => (
              <DraggableDealStageCard
                key={stage.id}
                stage={stage}
                onEdit={onEdit}
                onDelete={onDelete}
                isTerminalStage={isTerminalStage(stage.stageType)}
                isDeletable={stage.stageType === CrmDealStageEnum.OPEN}
                isDraggable={stage.stageType === CrmDealStageEnum.OPEN}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <hr className="w-full border-t border-secondary-accent" />
      <div className="flex flex-col gap-2">
        <p className="body1 text-secondary-text mb-3">
          {translateText(["dealsSection", "dealCompleteStateNote"])}
        </p>
        <ul className="flex flex-col gap-4">
          {terminalStages.map((stage) => (
            <DraggableDealStageCard
              key={stage.id}
              stage={stage}
              onEdit={onEdit}
              isTerminalStage={isTerminalStage(stage.stageType)}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DealStagesDraggableContent;
