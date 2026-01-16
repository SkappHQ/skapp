import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";

import { useAuth } from "../../auth/providers/AuthProvider";
import { useTranslator } from "../hooks/useTranslator";
import { useCommonStore } from "../stores/commonStore";
import { createWebSocketUrl } from "../utils/commonUtil";

interface WebSocketContextType {
  messages: string[];
  connect: (jwtToken: string) => void;
  disconnect: () => void;
  error: ErrorType | null;
}

interface ErrorType {
  title: string;
  description: string;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState<ErrorType | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const translateText = useTranslator("notifications");
  const { notifyData, setNotifyData } = useCommonStore((state) => state);

  useEffect(() => {
    if (user?.accessToken) {
      connect(user.accessToken);
    }

    return () => {
      disconnect();
    };
  }, [user]);

  const connect = (jwtToken: string) => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    const wsUrl = createWebSocketUrl("/ws/notification") + `?token=${jwtToken}`;
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onmessage = (event) => {
      setNotifyData({
        unreadCount: notifyData.unreadCount + 1
      });
      setMessages((prevMessages) => [...prevMessages, event.data]);
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError({
        title: translateText(["liveNotificationsRetrieveError"]),
        description: translateText([
          "liveNotificationsRetrieveErrorDescription"
        ])
      });
    };
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  };

  return (
    <WebSocketContext.Provider value={{ messages, connect, disconnect, error }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

export default WebSocketProvider;
