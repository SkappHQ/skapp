import { ButtonV2, Card } from "@rootcodelabs/skapp-ui";
import { FC, ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";

interface Props {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}

const SummaryCard: FC<Props> = ({ title, onEdit, children }) => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "createPolicy"
  );

  return (
    <Card className="flex flex-col gap-4 bg-white py-4">
      <div className="flex items-center justify-between">
        <h3 className="h2 text-black">{title}</h3>
        <ButtonV2
          variant="line"
          size="sm"
          onClick={onEdit}
          aria-label={`${translateText(["editBtnTxt"])} ${title}`}
          className="text-primary-text"
        >
          {translateText(["editBtnTxt"])}
        </ButtonV2>
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        {children}
      </div>
    </Card>
  );
};

export default SummaryCard;
