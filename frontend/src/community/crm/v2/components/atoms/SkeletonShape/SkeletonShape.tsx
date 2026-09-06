import { FC } from "react";

interface SkeletonShapeProps {
  className: string;
  circle?: boolean;
}

const SkeletonShape: FC<SkeletonShapeProps> = ({
  className,
  circle = false
}) => (
  <div
    className={`animate-pulse bg-secondary-accent ${circle ? "rounded-full" : "rounded"} ${className}`}
  />
);

export default SkeletonShape;
