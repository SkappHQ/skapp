import { Skeleton, type SxProps } from "@mui/material";
import { FC } from "react";

interface Props {
  height?: string | number;
  width?: string | number;
  numOfSkeletons?: number;
  variant?: "rounded" | "circular" | "rectangular";
  animation?: "pulse" | "wave" | false;
  styles?: SxProps;
}

const MultipleSkeletons: FC<Props> = ({
  height = "100%",
  width = "100%",
  numOfSkeletons = 1,
  variant = "rounded",
  animation = "wave",
  styles
}) => {
  return (
    <>
      {Array.from({ length: numOfSkeletons }, (_, i) => (
        <Skeleton
          key={i}
          variant={variant}
          width={width}
          height={height}
          sx={styles}
          animation={animation}
        />
      ))}
    </>
  );
};

export default MultipleSkeletons;
