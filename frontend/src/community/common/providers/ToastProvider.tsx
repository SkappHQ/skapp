import {
  type Dispatch,
  FC,
  ReactNode,
  type SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState
} from "react";

import { type ToastProps } from "../types/ToastTypes";

interface ToastContextProps {
  children: ReactNode;
}

export type Toast = {
  toastMessage: ToastProps;
  setToastMessage: Dispatch<SetStateAction<ToastProps>>;
};

export const initialState: ToastProps = {
  key: undefined,
  open: false,
  onClose: () => {},
  title: "",
  description: "",
  toastType: "info",
  autoHideDuration: 6000,
  toastMsgButtonText: ""
};

export const ToastContext = createContext<Toast>({
  toastMessage: initialState,
  setToastMessage: () => {}
});

const ToastProvider: FC<ToastContextProps> = ({ children }) => {
  const [toastMessage, setToastMessage] = useState<ToastProps>(initialState);

  return (
    <ToastContext.Provider value={{ toastMessage, setToastMessage }}>
      {children}
    </ToastContext.Provider>
  );
};

function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  // Memoize the context value to avoid unnecessary recalculations
  const memoizedContext = useMemo(() => context, [context]);

  return memoizedContext;
}

export { ToastProvider, useToast };
