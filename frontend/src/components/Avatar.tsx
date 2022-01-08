import { User } from 'common';
import Avatar, { AvatarTypeMap } from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import md5 from 'md5';
import { DefaultComponentProps } from '@mui/material/OverridableComponent';
import { createStyles, withStyles } from '@mui/styles';

interface AvatarProps extends DefaultComponentProps<AvatarTypeMap<{}, 'div'>> {
  user: User | null;
  online?: boolean;
}

const StyledBadge = withStyles((theme) =>
  createStyles({
    badge: {
      backgroundColor: '#44b700',
      color: '#44b700',
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      '&::after': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '75%',
        height: '75%',
        borderRadius: '50%',
        animation: '$ripple 1.2s infinite ease-in-out',
        border: '1px solid currentColor',
        content: '""',
      },
    },
    '@keyframes ripple': {
      '0%': {
        transform: 'scale(.8)',
        opacity: 1,
      },
      '100%': {
        transform: 'scale(2.4)',
        opacity: 0,
      },
    },
  })
)(Badge);

const getGravatar = (user: User | null) => {
  if (user && user.photo) {
    return user.photo;
  } else if (user) {
    return `https://www.gravatar.com/avatar/${md5(user.id)}?d=retro`;
  }
};

const CustomAvatar = ({ user, online, ...props }: AvatarProps) => {
  const displayName = user ? user.name : 'Not logged in';

  const avatar = (
    <Avatar
      {...props}
      alt={displayName}
      src={getGravatar(user)}
      title={displayName}
    />
  );

  if (online) {
    return (
      <StyledBadge
        overlap="circular"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        variant="dot"
      >
        {avatar}
      </StyledBadge>
    );
  }
  return avatar;
};

export default CustomAvatar;
