import { Stack } from "@mui/material";
import { ReactNode } from "react";

import TimeWidgetPopupController from "~community/attendance/components/organisms/TimeWidgetPopupController/TimeWidgetPopupController";
import FullScreenLoader from "~community/common/components/molecules/FullScreenLoader/FullScreenLoader";
import ToastMessage from "~community/common/components/molecules/ToastMessage/ToastMessage";
import AppBar from "~community/common/components/organisms/AppBar/AppBar";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import useRouteLoading from "~community/common/hooks/useRouteLoading";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import QuickSetupModalController from "~enterprise/common/components/organisms/QuickSetupModalController/QuickSetupModalController";

import styles from "./styles";

interface Props {
  children: ReactNode;
}

const ContentWithAppBar = ({ children }: Props) => {
  const classes = styles();

  const { toastMessage, setToastMessage } = useToast();
  const translateAria = useTranslator("commonAria", "contentWithDrawer");
  const loading = useRouteLoading();

  return (
    <>
      <Stack sx={classes.protectedWrapper}>
        <Stack sx={classes.contentWrapper}>
          <AppBar isDrawerAvailable={false} />
          {loading ? (
            <div
              role="status"
              aria-busy={true}
              aria-live="polite"
              style={{
                width: "100%",
                flex: 1,
                minHeight: 0,
                position: "relative"
              }}
            >
              <FullScreenLoader fullPage={false} zIndex={ZIndexEnums.MODAL} />
            </div>
          ) : (
            <main
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                flex: 1,
                minHeight: 0,
                overflowX: "clip",
                overflowY: "auto"
              }}
            >
              <Stack
                id="content-with-app-bar-main-content"
                tabIndex={0}
                role="document"
                aria-label={translateAria(["contentAreaWithDrawer"])}
                style={{
                  flexDirection: "column",
                  width: "100%",
                  flex: 1,
                  minHeight: 0,
                  overflowX: "clip"
                }}
              >
                {children}
              </Stack>
            </main>
          )}
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
      <QuickSetupModalController />
    </>
  );
};

export default ContentWithAppBar;
