export type ToastType = "info" | "success" | "error" | "warn" | undefined;

export interface ToastProps {
  key?: string | undefined;
  open: boolean;
  onClose?: () => void;
  title: string;
  description?: string;
  toastType?: ToastType;
  autoHideDuration?: number | null;
  toastMsgButtonText?: string;
  handleToastClick?: () => void;
  isIcon?: boolean;
}

export interface ToastMessageProps extends Omit<ToastProps, "key"> {
  toastKey?: string;
}
