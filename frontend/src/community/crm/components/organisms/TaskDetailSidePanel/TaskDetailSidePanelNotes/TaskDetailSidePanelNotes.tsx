import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";

interface Props {
  notes: string | null;
}

const SidePanelTaskNotes: FC<Props> = ({ notes }) => {
  const translateText = useTranslator("crmModule", "tasks", "sidePanel");

  return (
    <div className="flex flex-col gap-1">
      <p className="subtitle1">{translateText(["notes"])}</p>
      <p className="subtitle3">
        {notes || translateText(["noNotes"])}
      </p>
    </div>
  );
};

export default SidePanelTaskNotes;
