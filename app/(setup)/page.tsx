import { InitialModal } from '@/components/modals/initial-modal';
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
          // @ts-expect-error - TS doesn't know
          profileId: profile.id,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  if (server) {
    return redirect(`/servers/${server.id}`);
  }

  return (
    <div className='h-full flex items-center justify-center'>
      <InitialModal />
    </div>
  );
}
