import React from 'react';
import { v4 } from 'uuid';
import { render, getAllByRole } from '../../../../testing';
import SummaryMode from '../SummaryMode';
import { ColumnContent } from '../../types';
import { Post } from 'retro-board-common';

const buildPost = (likes: number, dislikes: number): Post => {
  const post: Post = {
    content: `${likes}/${dislikes}`,
    id: v4(),
    column: 0,
    user: {
      id: v4(),
      name: 'bar',
      username: '',
      accountType: 'anonymous',
      language: 'en',
      photo: '',
    },
    votes: [],
    action: '',
    giphy: null,
    group: null,
    rank: '',
  };

  post.votes = [
    ...new Array(likes).fill({
      id: v4(),
      type: 'like',
      count: 1,
      user: { id: v4(), name: 'bar' },
    }),
    ...new Array(dislikes).fill({
      id: v4(),
      type: 'dislike',
      count: 1,
      user: { id: v4(), name: 'bar' },
    }),
  ];

  return post;
};

const data: ColumnContent[] = [
  {
    label: 'First column',
    index: 0,
    color: 'red',
    icon: 'satisfied',
    type: 'well',
    posts: [
      buildPost(4, 0),
      buildPost(1, 0),
      buildPost(4, 1),
      buildPost(0, 0),
      buildPost(2, 0),
    ],
    groups: [],
  },
  {
    label: 'Second column',
    index: 1,
    color: 'green',
    icon: 'disatisfied',
    type: 'notWell',
    posts: [],
    groups: [],
  },
];

describe('SummaryMode', () => {
  it('Should display all columns', () => {
    const { getAllByRole } = render(<SummaryMode columns={data} />);
    const sections = getAllByRole('list');
    expect(sections).toHaveLength(2);
  });

  it('Should display all lines within a given column', () => {
    const container = render(<SummaryMode columns={data} />);
    const firstSection = container.getAllByRole('list')[0];
    const lines = getAllByRole(firstSection, 'listitem');
    expect(lines).toHaveLength(5);
  });

  it('Should display all lines ordered by votes', () => {
    const container = render(<SummaryMode columns={data} />);
    const firstSection = container.getAllByRole('list')[0];
    const lines = getAllByRole(firstSection, 'listitem');
    const texts = lines.map(
      line => line.getElementsByTagName('span')[2].innerHTML
    );

    expect(texts[0]).toBe('4/0');
    expect(texts[1]).toBe('4/1');
    expect(texts[2]).toBe('2/0');
    expect(texts[3]).toBe('1/0');
    expect(texts[4]).toBe('0/0');
  });
});
