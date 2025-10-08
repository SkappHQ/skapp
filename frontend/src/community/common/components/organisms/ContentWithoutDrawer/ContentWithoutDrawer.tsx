import { Stack } from "@mui/material";
import { ReactNode } from "react";

import ToastMessage from "~community/common/components/molecules/ToastMessage/ToastMessage";
import {
  initialState,
  useToast
} from "~community/common/providers/ToastProvider";

import styles from "./styles";

interface Props {
  children: ReactNode;
}

const ContentWithoutDrawer = ({ children }: Props) => {
  const classes = styles();

  const { toastMessage, setToastMessage } = useToast();

  return (
    <>
      <Stack sx={classes.unProtectedWrapper}>
        {children}
        <ToastMessage
          key={toastMessage.key}
          open={toastMessage.open}
          title={toastMessage.title}
          description={toastMessage.description}
          toastType={toastMessage.toastType}
          autoHideDuration={toastMessage.autoHideDuration}
          handleToastClick={toastMessage.handleToastClick}
          isIcon={toastMessage.isIcon}
          onClose={() => {
            setToastMessage((state) => ({ ...state, open: false }));
          }}
        />
      </Stack>
    </>
  );
};

export default ContentWithoutDrawer;
