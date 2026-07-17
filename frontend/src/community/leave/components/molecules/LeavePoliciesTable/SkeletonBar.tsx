import { FC } from "react";

interface Props {
  width: string;
  className?: string;
}

const SkeletonBar: FC<Props> = ({ width, className = "" }) => (
  <div
    className={`h-4 animate-pulse rounded-sm bg-neutral-200 ${width} ${className}`}
  />
);

export default SkeletonBar;
