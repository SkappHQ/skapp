import { Stack } from "@mui/material";
import { ReactNode } from "react";

import TimeWidgetPopupController from "~community/attendance/components/organisms/TimeWidgetPopupController/TimeWidgetPopupController";
import ToastMessage from "~community/common/components/molecules/ToastMessage/ToastMessage";
import AppBar from "~community/common/components/organisms/AppBar/AppBar";
import Drawer from "~community/common/components/organisms/Drawer/Drawer";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  initialState,
  useToast
} from "~community/common/providers/ToastProvider";
import MyRequestModalController from "~community/leave/components/organisms/MyRequestModalController/MyRequestModalController";
import QuickSetupModalController from "~enterprise/common/components/organisms/QuickSetupModalController/QuickSetupModalController";

import styles from "./styles";

interface Props {
  children: ReactNode;
}

const ContentWithDrawer = ({ children }: Props) => {
  const classes = styles();

  const { toastMessage, setToastMessage } = useToast();
  const translateAria = useTranslator("commonAria", "contentWithDrawer");

  return (
    <>
      <Stack sx={classes.protectedWrapper}>
        <Drawer />
        <Stack sx={classes.contentWrapper}>
          <AppBar />
          <main
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "100%",
              overflowX: "hidden"
            }}
          >
            <Stack
              id="content-with-drawer-main-content"
              tabIndex={0}
              role="document"
              aria-label={translateAria(["contentAreaWithDrawer"])}
              style={{
                flexDirection: "column",
                width: "100%",
                height: "100%",
                overflowX: "hidden"
              }}
            >
              {children}
            </Stack>
          </main>
        </Stack>
      </Stack>
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
      <TimeWidgetPopupController />
      <MyRequestModalController />
      <QuickSetupModalController />
    </>
  );
};

export default ContentWithDrawer;
