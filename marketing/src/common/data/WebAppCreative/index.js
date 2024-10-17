import envato from '@/common/assets/image/webAppCreative/clients/envato.png';
import evernote from '@/common/assets/image/webAppCreative/clients/evernote.png';
import forbes from '@/common/assets/image/webAppCreative/clients/forbes.png';
import geekwire from '@/common/assets/image/webAppCreative/clients/geekwire.png';
import slack from '@/common/assets/image/webAppCreative/clients/slack.png';
import usaToday from '@/common/assets/image/webAppCreative/clients/usa-today.png';
import icon1 from '@/common/assets/image/webAppCreative/icons/1.png';
import icon2 from '@/common/assets/image/webAppCreative/icons/2.png';
import icon3 from '@/common/assets/image/webAppCreative/icons/3.png';
import icon4 from '@/common/assets/image/webAppCreative/icons/4.png';
import icon5 from '@/common/assets/image/webAppCreative/icons/5.png';
import icon6 from '@/common/assets/image/webAppCreative/icons/6.png';
import icon7 from '@/common/assets/image/webAppCreative/icons/7.png';

import asana from '@/common/assets/image/webAppCreative/icons/asana.png';
import donut from '@/common/assets/image/webAppCreative/icons/donut.png';
import dribbble from '@/common/assets/image/webAppCreative/icons/dribbble.png';
import drive from '@/common/assets/image/webAppCreative/icons/drive.png';
import dropbox from '@/common/assets/image/webAppCreative/icons/dropbox.png';
import facebook from '@/common/assets/image/webAppCreative/icons/facebook.png';
import fontAwesome from '@/common/assets/image/webAppCreative/icons/fontawesome.png';
import github from '@/common/assets/image/webAppCreative/icons/github.png';
import googleCloud from '@/common/assets/image/webAppCreative/icons/google-cloud.png';
import icecream from '@/common/assets/image/webAppCreative/icons/icecream.png';
import messenger from '@/common/assets/image/webAppCreative/icons/messenger.png';
import nginx from '@/common/assets/image/webAppCreative/icons/nginx.png';
import pizza from '@/common/assets/image/webAppCreative/icons/pizza.png';
import slack2 from '@/common/assets/image/webAppCreative/icons/slack.png';
import smashingMag from '@/common/assets/image/webAppCreative/icons/smashing-mag.png';
import twitter from '@/common/assets/image/webAppCreative/icons/twitter.png';
import zeplin from '@/common/assets/image/webAppCreative/icons/zeplin.png';
import zoom from '@/common/assets/image/webAppCreative/icons/zoom.png';
import siteLogo from '@/common/assets/image/webAppCreative/logo.png';
import post1 from '@/common/assets/image/webAppCreative/post1.png';
import post2 from '@/common/assets/image/webAppCreative/post2.png';
import post3 from '@/common/assets/image/webAppCreative/post3.png';

export const clients = [envato, evernote, forbes, geekwire, slack, usaToday];

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
    title:
      'Why You Might Want to Reconsider with Tracking First Meaningful Paint',
    excerpt: {
      label: 'Learn More',
      link: '#',
    },
  },
];
