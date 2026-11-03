import { Tooltip } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";

interface Props {
  id: string;
  text: string;
}

const ActivityWarningTooltip: FC<Props> = ({ id, text }) => (
  <Tooltip id={`${id}-tooltip`} content={text} position="bottom">
    <span
      id={id}
      tabIndex={0}
      role="img"
      aria-label={text}
      className="inline-flex w-fit"
    >
      <Icon
        name={IconName.WARNING_ICON}
        fill="var(--color-semantic-amber-text)"
        width="16"
        height="16"
      />
    </span>
  </Tooltip>
);

export default ActivityWarningTooltip;
