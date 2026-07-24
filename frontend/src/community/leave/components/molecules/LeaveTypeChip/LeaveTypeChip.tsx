import { FC } from "react";

import { getEmoji } from "~community/common/utils/commonUtil";

interface Props {
  name: string;
  emojiCode: string | null;
  className?: string;
}

const LeaveTypeChip: FC<Props> = ({
  name,
  emojiCode,
  className = "bg-secondary-background px-5 py-3"
}) => (
  <span
    className={`body2 inline-flex w-fit items-center gap-2 rounded-full text-secondary-text ${className}`}
  >
    {emojiCode && (
      <span role="img" aria-hidden="true">
        {getEmoji(emojiCode)}
      </span>
    )}
    {name}
  </span>
);

export default LeaveTypeChip;
