import { FC } from "react";

interface Props {
  className: string;
}

const SkeletonCircle: FC<Props> = ({ className }) => (
  <div
    className={`animate-pulse rounded-full bg-secondary-accent ${className}`}
    role="presentation"
    aria-hidden="true"
  />
);

export default SkeletonCircle;
