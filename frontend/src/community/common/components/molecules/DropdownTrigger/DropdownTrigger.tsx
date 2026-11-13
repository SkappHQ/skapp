import { DropdownArrowIcon, TriggerProps } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

interface Props {
  label: string;
  isOpen: boolean;
  triggerProps: TriggerProps;
}

const DropdownTrigger: FC<Props> = ({ label, isOpen, triggerProps }) => {
  const { ref: triggerRef, ...buttonProps } = triggerProps;

  const handleRef = (element: HTMLButtonElement | null) => {
    triggerRef.current = element;
  };

  return (
    <button
      type="button"
      className="body1 bg-tertiary-background flex h-12 w-full cursor-pointer items-center justify-between rounded-lg px-4 text-black"
      {...buttonProps}
      ref={handleRef}
    >
      {label}
      <DropdownArrowIcon className={`size-3 ${isOpen ? "rotate-180" : ""}`} />
    </button>
  );
};

export default DropdownTrigger;
