import { StatusComponent } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

interface Props {
  isActive: boolean;
  text: string;
}

const LeavePolicyStatusBadge: FC<Props> = ({ isActive, text }) => (
  <StatusComponent
    text={text}
    iconColor={
      isActive
        ? "var(--color-semantic-green-accent)"
        : "var(--color-semantic-red-accent)"
    }
    textColor="text-secondary-text"
    className="w-fit"
  />
);

export default LeavePolicyStatusBadge;
