/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io as ClientIO } from 'socket.io-client';

type SocketContextType = {
  socket: any | null;
  isConnected: boolean;
  activeUsers: Set<string>;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  activeUsers: new Set(),
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    let socketInstance: any;

    async function connectSocket() {
      try {
        const { data } = await axios.get('/api/profile');

        console.log('Connecting to socket...', data);

        socketInstance = ClientIO(process.env.NEXT_PUBLIC_SITE_URL!, {
          path: '/api/socket/io',
          addTrailingSlash: false,
          query: { profileId: data.id },
        });

        socketInstance.on('connect', () => {
          setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
          setIsConnected(false);
        });

        socketInstance.on(
          'userStatus',
          ({ profileId, status }: { profileId: string; status: string }) => {
            setActiveUsers((prevActiveUsers) => {
              const updatedActiveUsers = new Set(prevActiveUsers);
              if (status === 'online') {
                updatedActiveUsers.add(profileId);
              } else {
                updatedActiveUsers.delete(profileId);
              }
              return updatedActiveUsers;
            });
          }
        );

        setSocket(socketInstance);
      } catch (error) {
        console.error('Error connecting to socket:', error);
      }
    }

    connectSocket();

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, activeUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
