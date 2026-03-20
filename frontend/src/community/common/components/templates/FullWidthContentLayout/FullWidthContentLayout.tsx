import { ButtonV2, ButtonV2Props } from "@rootcodelabs/skapp-ui";
import { JSX } from "react";

interface Props {
  title: string;
  children: JSX.Element;
  className?: string;
  primaryButtonProps?: ButtonV2Props;
  secondaryButtonProps?: ButtonV2Props;
}

const FullWidthContentLayout = ({
  title,
  children,
  className,
  primaryButtonProps,
  secondaryButtonProps
}: Props) => {
  return (
    <div className={`w-full h-auto overflow-y-auto ${className ?? ""}`}>
      <div className="flex flex-col gap-4 w-full px-5">
        <h1 className="h1">{title}</h1>
        <div className="flex flex-col-reverse sm:flex-row gap-2.5">
          {secondaryButtonProps && (
            <ButtonV2 {...secondaryButtonProps}>
              {secondaryButtonProps.children}
            </ButtonV2>
          )}
          {primaryButtonProps && (
            <ButtonV2 {...primaryButtonProps}>
              {primaryButtonProps.children}
            </ButtonV2>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};

export default FullWidthContentLayout;
