"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { usePathname } from "next/navigation";
import { getCurrentSession } from "./auth";
import { useApiData } from "@/app/context/apiContext";

// Define types for context values
interface WebSocketContextType {
  messages: string | null; // Assuming messages are strings, modify if necessary
  socket: WebSocket | null;
}

// Create context with default values
const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const useWebSocketContext = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider"
    );
  }
  return context;
};

// Type for WebSocketProvider props
interface WebSocketProviderProps {
  children: ReactNode;
  token : string
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,token
}) => {
  // const pathname = usePathname();

  // Type the state variables
  const [messages, setMessages] = useState<string | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  // const [sessionCookie, setSessionCookie] = useState<any>();

  // const getSess = async () => {
  //   const session = await getCurrentSession();
  //   console.log(session,'----session')
  //   try {
  //     if (session)
  //       if (session !== sessionCookie) {
  //         setSessionCookie(session);
  //       }
  //   } catch (error) {
  //     setTimeout(() => {
  //       getSess();
  //     }, 1000);
  //   }
  // };

  // useEffect(() => {
  //   getSess();
  // }, []);

  useEffect(() => {
    const setup = async () => {
      if (token) {
        const serverUrl = `${process.env.NEXT_PUBLIC_WEB_SOCKET_URL}${token}`;
        const socket = new WebSocket(serverUrl);
        socket.onmessage = (event) => {
          setMessages(event.data);
        };

        socket.onopen = () => {
          console.log("WebSocket connected");
        };

        socket.onerror = (error) => {
          console.error("WebSocket error", error);
        };

        setSocket(socket);
      }
    };

    if (token) {
      if (socket) {
        try {
          socket.close();
        } catch (error) {
          // Ignore errors when closing the socket
        }
      }
      setup();
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [token]);

  return (
    <WebSocketContext.Provider value={{ messages, socket }}>
      {children}
    </WebSocketContext.Provider>
  );
};