import React from 'react';
import { User } from 'retro-board-common';
import { Avatar } from '@material-ui/core';
import md5 from 'md5';

interface AvatarProps {
  user: User | null;
}

const getGravatar = (user: User | null) => {
  if (user && user.photo) {
    return user.photo;
  } else if (user) {
    return `https://www.gravatar.com/avatar/${md5(user.id)}?d=retro`;
  }
};

const CustomAvatar = ({ user }: AvatarProps) => {
  const displayName = user ? user.name : 'Not logged in';
  return (
    <Avatar alt={displayName} src={getGravatar(user)} title={displayName} />
  );
};

export default CustomAvatar;
