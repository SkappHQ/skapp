import { Button, ButtonProps } from "@rootcodelabs/skapp-ui";
import { JSX, ReactNode } from "react";

import {
  MediaQueries,
  useMediaQuery
} from "~community/common/hooks/useMediaQuery";

interface Props {
  title: string;
  leftColumn: ReactNode;
  centerColumn: ReactNode;
  rightColumn?: ReactNode;
  resetButtonProps: ButtonProps;
  applyButtonProps: ButtonProps;
}

const AdvancedFilterStructure = ({
  title,
  leftColumn,
  centerColumn,
  rightColumn,
  resetButtonProps,
  applyButtonProps
}: Props): JSX.Element => {
  const queryMatches = useMediaQuery();
  const isSmallScreen = queryMatches(MediaQueries.BELOW_1024);

  return (
    <div className="bg-white">
      <div className="px-5 py-4 border-b border-b-secondary-accent">
        <h1 className="h2">{title}</h1>
      </div>
      <div className="flex flex-row max-h-[350px]">
        <div className="flex-1 border-r border-r-secondary-accent">
          {leftColumn}
        </div>
        <div className="flex-2 border-r border-r-secondary-accent py-4">
          {centerColumn}
        </div>
        {!isSmallScreen && rightColumn && (
          <div className="flex-2 py-4">{rightColumn}</div>
        )}
      </div>
      <div className="border-t border-t-secondary-accent px-5 py-4 flex flex-row items-center justify-end gap-4">
        <Button
          variant="tertiary"
          size={isSmallScreen ? "sm" : "md"}
          {...resetButtonProps}
        />
        <Button size={isSmallScreen ? "sm" : "md"} {...applyButtonProps} />
      </div>
    </div>
  );
};

export default AdvancedFilterStructure;
