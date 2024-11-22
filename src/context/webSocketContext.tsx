'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { usePathname } from 'next/navigation';
import { getCurrentSession } from './auth';

// Define types for context values
interface WebSocketContextType {
  messages: string | null; // Assuming messages are strings, modify if necessary
  socket: WebSocket | null;
}

// Create context with default values
const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocketContext = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

// Type for WebSocketProvider props
interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const pathname = usePathname();

  // Type the state variables
  const [messages, setMessages] = useState<string | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [sessionCookie, setSessionCookie] = useState("");

  const getSess = async () => {
    const session = await getCurrentSession();
    if (session !== sessionCookie) {
      setSessionCookie(session.token);
    }
  };

  useEffect(() => {
    getSess();
  }, [pathname]);

  useEffect(() => {
    const setup = async () => {
      if (sessionCookie) {
        const serverUrl = `${process.env.NEXT_PUBLIC_WEB_SOCKET_URL}${sessionCookie}`;
        const socket = new WebSocket(serverUrl);
        socket.onmessage = (event) => {
          setMessages(event.data);
        };

        socket.onopen = () => {
          console.log('WebSocket connected');
        };

        socket.onerror = (error) => {
          console.error('WebSocket error', error);
        };

        setSocket(socket);
      }
    };

    if (sessionCookie) {
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
  }, [sessionCookie]);

  return (
    <WebSocketContext.Provider value={{ messages, socket }}>
      {children}
    </WebSocketContext.Provider>
  );
};