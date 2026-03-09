import { Button, ButtonProps } from "@rootcodelabs/skapp-ui";
import { JSX, ReactNode } from "react";

interface Props {
  title?: string;
  children: ReactNode;
  resetButtonProps: ButtonProps;
  applyButtonProps: ButtonProps;
}

const BasicFilterStructure = ({
  title,
  children,
  resetButtonProps,
  applyButtonProps
}: Props): JSX.Element => {
  return (
    <div className="bg-white flex flex-col rounded-2xl shadow-lg">
      <div className="pt-5 px-5 pb-4 flex flex-col gap-5 overflow-y-auto">
        {title && <p className="h2">{title}</p>}
        {children}
      </div>
      <div className="border-t border-t-secondary-accent px-5 pt-4 pb-5 flex flex-row items-center justify-end gap-4">
        <Button variant="tertiary" size="md" {...resetButtonProps} />
        <Button size="md" {...applyButtonProps} />
      </div>
    </div>
  );
};

export default BasicFilterStructure;
