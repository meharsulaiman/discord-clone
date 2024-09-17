'use client';

import React from 'react';
import { Avatar, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { useSocket } from './providers/socket-provider';
import { Badge } from './ui/badge';

interface UserAvatarProps {
  src?: string;
  className?: string;
  userId?: string;
}

const UserAvatar = ({ src, className, userId }: UserAvatarProps) => {
  const { activeUsers } = useSocket();

  const isActive = userId && activeUsers.has(userId);

  return (
    <div className='relative inline-block'>
      <Avatar className={cn('h-10 w-10', className)}>
        <AvatarImage src={src} />
      </Avatar>
      <span
        className={`absolute bottom-0 right-0 block h-2 w-2 rounded-full ${
          isActive ? 'bg-green-400' : 'bg-gray-400'
        }`}
      />
    </div>
  );
};

export default UserAvatar;
