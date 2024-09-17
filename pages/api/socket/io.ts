import { NextApiResponseServerIo } from '@/types';
import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';

export const config = {
  api: {
    bodyParser: false,
  },
};

const activeUsers = new Set<string>();

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    const path = '/api/socket/io';
    const httpServer: NetServer = res.socket.server;

    const io = new ServerIO(httpServer, {
      path: path,
      addTrailingSlash: false,
    });

    io.on('connection', (socket) => {
      const profileId = socket.handshake.query.profileId as string;

      activeUsers.add(profileId);
      io.emit('userStatus', { profileId, status: 'online' });

      socket.on('disconnect', () => {
        activeUsers.delete(profileId);
        io.emit('userStatus', { profileId, status: 'offline' });
      });
    });

    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
