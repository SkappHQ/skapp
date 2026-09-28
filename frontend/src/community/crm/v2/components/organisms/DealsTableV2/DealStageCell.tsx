import { Dropdown } from "@rootcodelabs/skapp-ui";
import { FC, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import StageLabel from "~community/crm/v2/components/atoms/StageLabel/StageLabel";
import { useStageNameMapper } from "~community/crm/v2/hooks/useStageNameMapper";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { getOrderedStages } from "~community/crm/v2/utils/commonUtil";

import EditableCell from "./EditableCell";

interface Props {
  stageId?: number;
  onSave: (stageId: number) => void;
}

const DealStageCell: FC<Props> = ({ stageId, onSave }) => {
  const translateText = useTranslator("crmModuleV2");
  const translateAria = useTranslator("crmAriaV2");
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
      ariaLabel={translateAria(["deals", "common", "stage"])}
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
        placeholder={translateText([
          "deals",
          "common",
          "placeholders",
          "stage"
        ])}
        ariaLabel={translateAria(["deals", "common", "stage"])}
      />
    </EditableCell>
  );
};

export default DealStageCell;
