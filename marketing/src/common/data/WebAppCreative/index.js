import envato from '../../../common/assets/image/webAppCreative/clients/envato.png';
import evernote from '../../../common/assets/image/webAppCreative/clients/evernote.png';
import forbes from '../../../common/assets/image/webAppCreative/clients/forbes.png';
import geekwire from '../../../common/assets/image/webAppCreative/clients/geekwire.png';
import slack from '../../../common/assets/image/webAppCreative/clients/slack.png';
import usaToday from '../../../common/assets/image/webAppCreative/clients/usa-today.png';
import icon1 from '../../../common/assets/image/webAppCreative/icons/1.png';
import icon2 from '../../../common/assets/image/webAppCreative/icons/2.png';
import icon3 from '../../../common/assets/image/webAppCreative/icons/3.png';
import icon4 from '../../../common/assets/image/webAppCreative/icons/4.png';
import icon5 from '../../../common/assets/image/webAppCreative/icons/5.png';
import icon6 from '../../../common/assets/image/webAppCreative/icons/6.png';
import icon7 from '../../../common/assets/image/webAppCreative/icons/7.png';

import asana from '../../../common/assets/image/webAppCreative/icons/asana.png';
import drive from '../../../common/assets/image/webAppCreative/icons/drive.png';
import dropbox from '../../../common/assets/image/webAppCreative/icons/dropbox.png';
import fontAwesome from '../../../common/assets/image/webAppCreative/icons/fontawesome.png';
import github from '../../../common/assets/image/webAppCreative/icons/github.png';
import googleCloud from '../../../common/assets/image/webAppCreative/icons/google-cloud.png';
import messenger from '../../../common/assets/image/webAppCreative/icons/messenger.png';
import nginx from '../../../common/assets/image/webAppCreative/icons/nginx.png';
import slack2 from '../../../common/assets/image/webAppCreative/icons/slack.png';
import smashingMag from '../../../common/assets/image/webAppCreative/icons/smashing-mag.png';
import zeplin from '../../../common/assets/image/webAppCreative/icons/zeplin.png';
import zoom from '../../../common/assets/image/webAppCreative/icons/zoom.png';
import icecream from '../../../common/assets/image/webAppCreative/icons/icecream.png';
import donut from '../../../common/assets/image/webAppCreative/icons/donut.png';
import pizza from '../../../common/assets/image/webAppCreative/icons/pizza.png';
import post1 from '../../../common/assets/image/webAppCreative/post1.png';
import post2 from '../../../common/assets/image/webAppCreative/post2.png';
import post3 from '../../../common/assets/image/webAppCreative/post3.png';
import siteLogo from '../../../common/assets/image/webAppCreative/logo.png';
import facebook from '../../../common/assets/image/webAppCreative/icons/facebook.png';
import twitter from '../../../common/assets/image/webAppCreative/icons/twitter.png';
import dribbble from '../../../common/assets/image/webAppCreative/icons/dribbble.png';

export const clients = [envato, evernote, forbes, geekwire, slack, usaToday];



export const appIntegration = {
  sectionTitle: 'Lets see what we integrate',
  sectionDesc: `We recently had to jump on 10+ different plugin across eight different countries to find the right owner and escalation process.`,
  apps: [
    {
      id: 1,
      icon: nginx,
      name: 'nginx',
      bgColor: null,
      isBlurred: false,
    },
    {
      id: 2,
      icon: googleCloud,
      name: 'googleCloud',
      bgColor: '#fff',
      isBlurred: false,
    },
    {
      id: 3,
      icon: slack2,
      name: 'slack',
      bgColor: null,
      isBlurred: false,
    },
    {
      id: 4,
      icon: dropbox,
      name: 'dropbox',
      bgColor: '#fff',
      isBlurred: false,
    },
    {
      id: 5,
      icon: drive,
      name: 'drive',
      bgColor: null,
      isBlurred: false,
    },
    {
      id: 6,
      icon: asana,
      name: 'asana',
      bgColor: null,
      isBlurred: false,
    },
    {
      id: 7,
      icon: github,
      name: 'github',
      bgColor: '#fff',
      isBlurred: false,
    },
    {
      id: 8,
      icon: zeplin,
      name: 'zeplin',
      bgColor: null,
      isBlurred: false,
    },
    {
      id: 9,
      icon: nginx,
      name: 'nginx',
      bgColor: null,
      isBlurred: true,
    },
    {
      id: 10,
      icon: messenger,
      name: 'messenger',
      bgColor: null,
      isBlurred: false,
    },
    {
      id: 11,
      icon: zoom,
      name: 'zoom',
      bgColor: null,
      isBlurred: false,
    },
    {
      id: 12,
      icon: smashingMag,
      name: 'smashingMag',
      bgColor: '#fff',
      isBlurred: false,
    },
    {
      id: 13,
      icon: fontAwesome,
      name: 'fontAwesome',
      bgColor: null,
      isBlurred: false,
    },
    {
      id: 14,
      icon: drive,
      name: 'google drive',
      bgColor: null,
      isBlurred: true,
    },
  ],
};

export const pricing = [
  {
    id: 1,
    price: {
      monthly: 16,
      annual: 16 * 12 - 5,
    },
    currencySymbol: '$',
    isActive: false,
    title: 'Starter Pack',
    desc: 'Complete time tracking & proper reporting',
    icon: icecream,
    button: {
      label: 'Start 6 month trial',
      link: '#',
    },
    details: {
      label: 'What’s include',
      link: '#',
    },
  },
  {
    id: 2,
    price: {
      monthly: 29,
      annual: 29 * 12 - 10,
    },
    currencySymbol: '$',
    isActive: true,
    title: 'Premium Pack',
    desc: 'Effortless team with time management.',
    icon: donut,
    button: {
      label: 'Start 6 month trial',
      link: '#',
    },
    details: {
      label: 'What’s include',
      link: '#',
    },
  },
  {
    id: 3,
    price: {
      monthly: 35,
      annual: 35 * 12 - 15,
    },
    currencySymbol: '$',
    isActive: false,
    title: 'Ultimate Pack',
    desc: 'A custom plan for complex or large organization.',
    icon: pizza,
    button: {
      label: 'Start 6 month trial',
      link: '#',
    },
    details: {
      label: 'What’s include',
      link: '#',
    },
  },
];

export const posts = [
  {
    id: 1,
    date: 'June 3, 2020',
    image: post1,
    title: 'The three Fundamental Rules to Keep Your Website Goal Orientated',
    excerpt: {
      label: 'Learn More',
      link: '#',
    },
  },
  {
    id: 2,
    date: 'Dec 8, 2020',
    image: post2,
    title: 'Five Common Mistakes Teams Make When Tracking Performance',
    excerpt: {
      label: 'Learn More',
      link: '#',
    },
  },
  {
    id: 3,
    date: 'Dec 8, 2020',
    image: post3,
    title: `Why You Might Want to Reconsider with Tracking First Meaningful Paint`,
    excerpt: {
      label: 'Learn More',
      link: '#',
    },
  },
];
