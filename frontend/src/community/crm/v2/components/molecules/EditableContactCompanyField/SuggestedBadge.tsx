import { Badge } from "@rootcodelabs/skapp-ui";
import { FC, ReactNode } from "react";

interface SuggestedBadgeProps {
  children: ReactNode;
  label: string;
}

const SuggestedBadge: FC<SuggestedBadgeProps> = ({ children, label }) => (
  <span className="flex items-center gap-2">
    {children}
    <Badge
      size="sm"
      backgroundColor="bg-semantic-green-background"
      textColor="text-semantic-green-text"
    >
      {label}
    </Badge>
  </span>
);

export default SuggestedBadge;
