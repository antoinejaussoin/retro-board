import React from 'react';
import { noop, groupBy, values } from 'lodash';
import { render, fireEvent } from '../../../../testing';
import PostItem from '../Post';
import { Post, User, Vote, VoteType } from 'retro-board-common';

const u = (name: string): User => ({
  name,
  id: name,
  accountType: 'anonymous',
  username: name,
  photo: null,
  language: 'en',
});

function buildVotes(type: VoteType, users: User[], post: Post): Vote[] {
  const grouped = groupBy(users, (u) => u.id);
  return values(grouped).map(
    (group) =>
      ({
        id: 'whatever',
        count: group.length,
        post,
        type,
        user: group[0],
      } as Vote)
  );
}

const post: Post = {
  content: 'Foo',
  votes: [],
  user: u('Anne-Claire'),
  id: '1',
  column: 0,
  action: '',
  giphy: null,
  group: null,
  rank: '',
};

post.votes = [
  ...buildVotes('like', ['Charlotte', 'Apolline', 'Armand'].map(u), post),
  ...buildVotes('dislike', ['Didier', 'Danièle'].map(u), post),
];

describe('Post', () => {
  it('Should properly display the post content', () => {
    const { getByLabelText } = render(
      <PostItem
        post={post}
        index={1}
        onEditGiphy={noop}
        onDelete={noop}
        onDislike={noop}
        onEdit={noop}
        onLike={noop}
        onEditAction={noop}
        color="#123456"
      />
    );
    const display = getByLabelText(/post content/i);
    expect(display.textContent).toBe('Foo');
  });

  it('Should let the user like and dislike the post but not delete if he didnt write the post', () => {
    const deleteHandler = jest.fn();
    const likeHandler = jest.fn();
    const dislikeHandler = jest.fn();
    const { getByLabelText, queryByText } = render(
      <PostItem
        post={post}
        index={1}
        onEditGiphy={noop}
        onDelete={deleteHandler}
        onDislike={dislikeHandler}
        onEdit={noop}
        onLike={likeHandler}
        onEditAction={noop}
        color="#123456"
      />
    );
    const deleteButton = queryByText(/delete/i);
    const likeButton = getByLabelText(/^like/i);
    const dislikeButton = getByLabelText(/dislike/i);

    expect(deleteButton).toBeNull();

    expect(likeButton).toHaveTextContent('3');
    expect(dislikeButton).toHaveTextContent('2');
    likeButton.click();
    expect(likeHandler).toHaveBeenCalledTimes(1);
    expect(dislikeHandler).not.toHaveBeenCalled();

    dislikeButton.click();
    expect(dislikeHandler).toHaveBeenCalledTimes(1);

    expect(deleteHandler).not.toHaveBeenCalled();
  });

  it('Should let the user delete the post if the author is the user, but not like or dislike', () => {
    const customPost: Post = {
      ...post,
      user: u('John Doe'),
    };
    const deleteHandler = jest.fn();
    const likeHandler = jest.fn();
    const dislikeHandler = jest.fn();

    const { getByLabelText } = render(
      <PostItem
        post={customPost}
        index={1}
        onEditGiphy={noop}
        onDelete={deleteHandler}
        onDislike={dislikeHandler}
        onEdit={noop}
        onLike={likeHandler}
        onEditAction={noop}
        color="#123456"
      />
    );
    const deleteButton = getByLabelText(/delete/i);
    const likeButton = getByLabelText(/^like/i);
    const dislikeButton = getByLabelText(/dislike/i);

    deleteButton.click();
    expect(deleteHandler).toHaveBeenCalledTimes(1);

    expect(likeButton).toBeDisabled();
    expect(dislikeButton).toBeDisabled();
    likeButton.click();
    dislikeButton.click();
    expect(likeHandler).not.toHaveBeenCalled();
    expect(dislikeHandler).not.toHaveBeenCalled();
  });

  it('Should let the user edit the post if the author is the user', () => {
    const customPost: Post = {
      ...post,
      user: u('John Doe'),
    };
    const editHandler = jest.fn();

    const { getByLabelText } = render(
      <PostItem
        post={customPost}
        index={1}
        onEditGiphy={noop}
        onDelete={noop}
        onDislike={noop}
        onEdit={editHandler}
        onEditAction={noop}
        onLike={noop}
        color="#123456"
      />
    );
    const editableLabel = getByLabelText(/post content/i);
    editableLabel.click();
    expect(editHandler).not.toHaveBeenCalled();
    const editableInput = getByLabelText(/post content input/i);
    fireEvent.change(editableInput, { target: { value: 'Bar' } });
    fireEvent.keyPress(editableInput, { keyCode: 13 });
    expect(editHandler).toHaveBeenCalled();
    expect(editHandler).toHaveBeenCalledWith('Bar');
  });

  it('Should NOT let the user edit the post if the author is NOT the user', () => {
    const customPost: Post = {
      ...post,
      user: u('Somebody else'),
    };
    const editHandler = jest.fn();

    const { getByLabelText, queryByLabelText } = render(
      <PostItem
        post={customPost}
        index={1}
        onEditGiphy={noop}
        onDelete={noop}
        onDislike={noop}
        onEdit={editHandler}
        onEditAction={noop}
        onLike={noop}
        color="#123456"
      />
    );
    const editableLabel = getByLabelText(/post content/i);
    editableLabel.click();
    const editableInput = queryByLabelText(/post content input/i);
    expect(editableInput).toBeNull();
    expect(editHandler).not.toHaveBeenCalled();
  });
});
