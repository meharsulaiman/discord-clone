import { currentProfile } from '@/lib/current-profile-pages';
import { db } from '@/lib/db';
import { NextApiResponseServerIo } from '@/types';
import { NextApiRequest } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'method not allowed',
    });
  }

  try {
    const profile = await currentProfile(req);

    const { content, fileUrl } = req.body;
    const { serverId, channelId } = req.query;

    if (!profile) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    if (!serverId || !channelId) {
      return res.status(400).json({
        message: 'serverId and channelId are required',
      });
    }

    if (!content) {
      return res.status(400).json({
        message: 'content is required',
      });
    }

    const server = await db.server.findFirst({
      where: {
        id: serverId as string,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!server) {
      return res.status(404).json({
        message: 'Server not found',
      });
    }

    const channel = await db.channel.findFirst({
      where: {
        id: channelId as string,
        serverId: serverId as string,
      },
    });

    if (!channel) {
      return res.status(404).json({
        message: 'Channel not found',
      });
    }

    const member = server.members.find(
      (member) => member.profileId === profile.id
    );

    if (!member) {
      return res.status(404).json({
        message: 'Member not found',
      });
    }

    const message = await db.message.create({
      data: {
        content,
        fileUrl,
        memberId: member.id,
        channelId: channelId as string,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    const channelKey = `chat:${channelId}:messages`;

    if (res?.socket?.server?.io?.emit) {
      res.socket.server.io.emit(channelKey, message);
    } else {
      console.warn('Socket.IO not initialized or emit function not available');
    }

    return res.status(200).json({
      message,
    });
  } catch (error) {
    console.error('Error in message handler:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
