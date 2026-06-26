import { parseHexToRgb } from "./commonUtil";

interface GetRgbForBlinkProps {
  isAnimationOn: boolean;
  color: string;
}

export const getRgbForBlink = ({
  isAnimationOn,
  color
}: GetRgbForBlinkProps) => {
  if (isAnimationOn) {
    const rgbValues = parseHexToRgb(color);

    return `${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b}`;
  }

  return "";
};
