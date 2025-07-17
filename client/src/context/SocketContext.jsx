
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';


const SocketContext = createContext(null);

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    
    if (authLoading) return;
    if (!user) return; 
    const newSocket = io(import.meta.env.VITE_API_BASE_URL, {
      auth: { token: localStorage.getItem('token') },
    });

    newSocket.on('connect', () => {
      newSocket.emit('register', { userId: user._id, role: user.role });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, authLoading]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}
