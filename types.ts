import { Member, Profile, Server } from '@prisma/client';

import { Socket } from 'net';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';
import { Server as HttpServer } from 'http';

export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & {
    server: HttpServer & {
      io: SocketIOServer;
    };
  };
};

export type ServerWithMembersWithProfile = Server & {
  members: (Member & { profile: Profile })[];
};
