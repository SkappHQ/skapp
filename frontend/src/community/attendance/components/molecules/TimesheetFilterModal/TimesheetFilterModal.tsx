import { Popper } from "@rootcodelabs/skapp-ui";
import { JSX } from "react";

import TimesheetFilterModalBody from "~community/attendance/components/molecules/TimesheetFilterModalBody/TimesheetFilterModalBody";
import useAutoFocusMenuListener from "~community/common/utils/hooks/useAutoFocusMenuListeners";

interface Props {
  anchorEl: null | HTMLElement;
  handleClose: () => void;
  id: string | undefined;
  open: boolean;
  position?: "bottom-start" | "bottom-end";
  onApply: (
    selectedFilters: Record<string, string[]>,
    selectedFilterLabels: string[]
  ) => void;
  onReset: () => void;
  isManager?: boolean;
}

const TimesheetFilterModal = ({
  anchorEl,
  handleClose,
  id,
  open,
  position = "bottom-end",
  onApply,
  onReset,
  isManager = false
}: Props): JSX.Element => {
  useAutoFocusMenuListener(anchorEl, id ?? "", handleClose);
  return (
    <Popper
      id={id}
      open={open}
      anchorEl={anchorEl}
      position={position}
      handleClose={handleClose}
      ariaLabel="dialog"
      ariaRole="dialog"
    >
      <TimesheetFilterModalBody
        onApply={onApply}
        onReset={onReset}
        isManager={isManager}
      />
    </Popper>
  );
};

export default TimesheetFilterModal;
