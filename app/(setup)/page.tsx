import { db } from '@/lib/db';
import { initialProfile } from '@/lib/initial-profile';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function Setup() {
  const profile = await initialProfile();

  if (!profile) {
    throw new Error('Profile not found');
  }

  const server = await db.server.findFirst({
    where: {
      members: {
        some: {
          // @ts-expect-error - TS doesn't know about the Clerk profileId
          profileId: profile.id,
        },
      },
    },
  });

  if (server) {
    return redirect(`/servers/${server.id}`);
  }

  return <div>create a server</div>;
}
