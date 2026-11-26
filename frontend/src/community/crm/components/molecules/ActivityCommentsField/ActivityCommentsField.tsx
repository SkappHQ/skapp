import { TextArea } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";

interface Props {
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  rows: number;
  ariaLabel: string;
}

const ActivityCommentsField: FC<Props> = ({
  value,
  onChange,
  rows,
  ariaLabel
}) => {
  const translateText = useTranslator("crmModule", "activities", "logActivity");

  return (
    <TextArea
      name="comments"
      value={value}
      label={translateText(["labels", "comments"])}
      placeholder={translateText(["placeholders", "comments"])}
      onChange={onChange}
      rows={rows}
      aria-label={ariaLabel}
    />
  );
};

export default ActivityCommentsField;
