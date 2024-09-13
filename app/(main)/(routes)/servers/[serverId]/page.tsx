import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

interface ServerPageProps {
  params: {
    serverId: string;
  };
}

const ServerPage = async ({ params }: ServerPageProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return auth().redirectToSignIn();
  }

  const server = await db.server.findUnique({
    where: {
      id: params.serverId,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
    include: {
      channels: {
        where: {
          name: 'general',
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  const generalChannel = server?.channels[0];

  if (generalChannel?.name !== 'general') {
    return null;
  }

  return redirect(`/servers/${params.serverId}/channels/${generalChannel.id}`);
};

export default ServerPage;
