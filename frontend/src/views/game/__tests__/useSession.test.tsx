import useSession from '../useSession';
import { AllTheProviders, initialSession } from '../../../testing/index';
import { renderHook, act } from '@testing-library/react-hooks';
import { Post, Session } from 'common';
import { cloneDeep } from 'lodash';

function post(id: string): Post {
  return {
    id,
    content: 'foo',
    votes: [],
    action: '',
    column: 0,
    giphy: null,
    group: null,
    rank: '0',
    user: { id: '1', name: 'danièle', photo: 'bl' },
  };
}

function render(modifySession?: (session: Session) => Session) {
  const { result } = renderHook(() => useSession(), {
    wrapper: AllTheProviders,
  });
  if (modifySession) {
    act(() => {
      result.current.receiveBoard(modifySession(cloneDeep(initialSession)));
    });
  }
  return result;
}

describe('useSession', () => {
  it('Should have some session data at the start', () => {
    const context = render();
    expect(context.current.session).not.toBe(null);
  });

  describe('Renaming a session', () => {
    it('Should rename the session correctly', () => {
      const context = render();
      expect(context.current.session?.name).toBe('My Retro');
      act(() => {
        context.current.renameSession('Something else');
      });
      expect(context.current.session?.name).toBe('Something else');
    });
  });

  describe('Reseting a session', () => {
    it('Should set the session to null', () => {
      const context = render();
      expect(context.current.session).not.toBeNull();
      act(() => {
        context.current.resetSession();
      });
      expect(context.current.session).toBeNull();
    });
  });

  describe('Receiving a new post', () => {
    it('Should append the post at the end of the list', () => {
      const context = render((session) => ({
        ...session,
        posts: [post('1'), post('2'), post('3')],
      }));
      act(() => {
        context.current.receivePost(post('4'));
      });
      expect(context.current.session?.posts.length).toBe(4);
      expect(context.current.session?.posts[3].id).toBe('4');
    });
  });

  describe('Updating post', () => {
    it('Should replace the correct post', () => {
      const context = render((session) => ({
        ...session,
        posts: [post('1'), post('2'), post('3')],
      }));
      act(() => {
        context.current.updatePost({
          ...post('2'),
          content: 'bar',
        });
      });
      expect(context.current.session?.posts.length).toBe(3);
      expect(context.current.session?.posts[1].id).toBe('2');
      expect(context.current.session?.posts[0].content).toBe('foo');
      expect(context.current.session?.posts[1].content).toBe('bar');
      expect(context.current.session?.posts[2].content).toBe('foo');
    });
  });

  describe('Deleting a post', () => {
    it('Should delete the correct post', () => {
      const context = render((session) => ({
        ...session,
        posts: [post('1'), post('2'), post('3')],
      }));
      act(() => {
        context.current.deletePost('2');
      });
      expect(context.current.session?.posts.length).toBe(2);
      expect(context.current.session?.posts[0].id).toBe('1');
      expect(context.current.session?.posts[1].id).toBe('3');
    });
  });
});
