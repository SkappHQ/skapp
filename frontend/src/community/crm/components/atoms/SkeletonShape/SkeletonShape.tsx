import { FC } from "react";

interface Props {
  className: string;
  circle?: boolean;
}

const SkeletonShape: FC<Props> = ({ className, circle = false }) => (
  <div
    className={`animate-pulse bg-secondary-accent ${circle ? "rounded-full" : "rounded"} ${className}`}
  />
);

export default SkeletonShape;
