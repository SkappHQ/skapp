import { Button, ButtonProps } from "@rootcodelabs/skapp-ui";
import { JSX, ReactNode } from "react";

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
  return (
    <div className="bg-white max-h-[500px]">
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
        <div className="flex-2 py-4">{rightColumn}</div>
      </div>
      <div className="border-t border-t-secondary-accent px-5 py-4 flex flex-row items-center justify-end gap-4">
        <Button variant="tertiary" size="md" {...resetButtonProps} />
        <Button size="md" {...applyButtonProps} />
      </div>
    </div>
  );
};

export default AdvancedFilterStructure;
