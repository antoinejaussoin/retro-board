import React from 'react';
import {
  SentimentSatisfied,
  SentimentVeryDissatisfied,
  WbSunny,
  Announcement,
  AttachFile,
  AttachMoney,
  Autorenew,
  PlayArrow,
  FastForward,
  Pause,
  ThumbUpAlt,
  LocalLibrary,
  LiveHelp,
  LocalBar,
  Link,
  DirectionsBoat,
  Gesture,
  FitnessCenter,
} from '@material-ui/icons';
import { IconName } from '@retrospected/common';

export function getIcon(name: IconName | null): React.ComponentType | null {
  switch (name) {
    case 'satisfied':
      return SentimentSatisfied;
    case 'disatisfied':
      return SentimentVeryDissatisfied;
    case 'sunny':
      return WbSunny;
    case 'announcement':
      return Announcement;
    case 'file':
      return AttachFile;
    case 'money':
      return AttachMoney;
    case 'renew':
      return Autorenew;
    case 'play':
      return PlayArrow;
    case 'pause':
      return Pause;
    case 'fast-forward':
      return FastForward;
    case 'liked':
      return ThumbUpAlt;
    case 'books':
      return LocalLibrary;
    case 'help':
      return LiveHelp;
    case 'cocktail':
      return LocalBar;
    case 'boat':
      return DirectionsBoat;
    case 'link':
      return Link;
    case 'gesture':
      return Gesture;
    case 'fitness':
      return FitnessCenter;
    default:
      return null;
  }
}

export function getAllIcons(): IconName[] {
  return [
    'satisfied',
    'disatisfied',
    'sunny',
    'announcement',
    'file',
    'money',
    'renew',
    'play',
    'pause',
    'fast-forward',
    'liked',
    'books',
    'help',
    'cocktail',
    'boat',
    'link',
    'gesture',
    'fitness',
  ];
}
