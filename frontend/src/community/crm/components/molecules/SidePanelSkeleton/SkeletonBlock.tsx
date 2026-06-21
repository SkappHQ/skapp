import { FC } from "react";

interface Props {
  className: string;
}

const SkeletonBlock: FC<Props> = ({ className }) => (
  <div
    className={`animate-pulse rounded bg-secondary-accent ${className}`}
    role="presentation"
    aria-hidden="true"
  />
);

export default SkeletonBlock;
