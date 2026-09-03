import { Dropdown } from "@rootcodelabs/skapp-ui";
import { FC, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import useStageNameMapper from "~community/crm/hooks/useStageNameMapper";
import StageLabel from "~community/crm/v2/components/atoms/StageLabel/StageLabel";
import EditableCell from "~community/crm/v2/components/molecules/EditableCell/EditableCell";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { getOrderedStages } from "~community/crm/v2/utils/commonUtil";

interface Props {
  stageId?: number;
  onSave: (stageId: number) => void;
}

const DealStageCell: FC<Props> = ({ stageId, onSave }) => {
  const translateText = useTranslator("crmModule", "deals", "dealsTable");
  const { getStageByName } = useStageNameMapper();
  const [isEditing, setIsEditing] = useState(false);

  const stagesRecord = useCrmStoreV2(useShallow((store) => store.stages));
  const stages = useMemo(() => getOrderedStages(stagesRecord), [stagesRecord]);
  const stage = stageId != null ? stagesRecord[stageId] : undefined;

  const options = useMemo(
    () =>
      stages.map((item) => ({
        id: String(item.id),
        value: String(item.id),
        label: (
          <StageLabel
            label={getStageByName(item.name ?? "")}
            color={item.color}
          />
        )
      })),
    [stages, getStageByName]
  );

  const handleChange = (value: string): void => {
    const nextStageId = Number(value);
    setIsEditing(false);
    if (!Number.isNaN(nextStageId) && nextStageId !== stageId) {
      onSave(nextStageId);
    }
  };

  return (
    <EditableCell
      isEditing={isEditing}
      ariaLabel={translateText(["inlineEdit", "ariaLabels", "stage"])}
      onStartEditing={() => setIsEditing(true)}
      onClickOutside={() => setIsEditing(false)}
      display={
        <StageLabel
          label={getStageByName(stage?.name ?? "") || "-"}
          color={stage?.color}
        />
      }
    >
      <Dropdown
        options={options}
        value={stageId != null ? String(stageId) : ""}
        onChange={handleChange}
        variant="primary"
        className="rounded-lg"
        width="100%"
        placeholder={translateText(["inlineEdit", "placeholders", "stage"])}
        ariaLabel={translateText(["inlineEdit", "ariaLabels", "stage"])}
      />
    </EditableCell>
  );
};

export default DealStageCell;
