import { Modal, SxProps, Theme } from "@mui/material";
import { FC, MouseEvent, ReactElement } from "react";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { mergeSx } from "~community/common/utils/commonUtil";

interface Props {
  open: boolean;
  onClose: (_event: MouseEvent<HTMLButtonElement>, reason: string) => void;
  children: ReactElement;
  sx?: SxProps<Theme>;
  ids?: {
    title?: string;
    description?: string;
    closeButton?: string;
  };
}

const BasicModal: FC<Props> = ({
  open = false,
  onClose,
  children,
  sx,
  ids
}) => {
  return (
    <Modal
      disablePortal
      aria-labelledby={ids?.title}
      aria-describedby={ids?.description}
      open={open}
      onClose={(event, reason) => {
        if (reason === "backdropClick") return;
        onClose(event as MouseEvent<HTMLButtonElement>, reason);
      }}
      disableEscapeKeyDown
      slotProps={{ backdrop: { timeout: 100 } }}
      sx={mergeSx([
        {
          zIndex: ZIndexEnums.MODAL
        },
        sx
      ])}
    >
      {children}
    </Modal>
  );
};

export default BasicModal;
