import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Post } from 'common';
import {
  GripVertical,
  Image,
  Smile,
  SquareCheck,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EditableLabel from '../../../../components/EditableLabel';
import GiphySearchBox from '../../../../components/GiphySearchBox';
import useCanDecrypt from '../../../../crypto/useCanDecrypt';
import useCrypto from '../../../../crypto/useCrypto';
import useGiphy from '../../../../hooks/useGiphy';
import useToggle from '../../../../hooks/useToggle';
import { trackEvent } from '../../../../track';
import { Palette } from '../../../../Theme';
import config from '../../../../utils/getConfig';
import { useConfirm } from 'ui/confirm';
import { Popover, PopoverContent, PopoverTrigger } from 'ui/popover';
import { Tooltip } from 'ui/tooltip';
import type { DropIntent } from '../drag';
import { bindTouchDrag } from '../touch-drag';
import { usePostUserPermissions } from '../usePostUserPermissions';
import { countVotes, enumerateVotes } from '../../utils';
import useUser from '../../../../state/user/useUser';
import ActionButton from './ActionButton';
import ActionsBar from './ActionsBar';
import { getLorem } from './lorem';
import ReactionBar from './ReactionBar';
import VoteButton from './VoteButton';

interface PostItemProps {
  post: Post;
  color: string;
  onLike: () => void;
  onDislike: () => void;
  onCancelVotes: () => void;
  onReact: (emoji: string) => void;
  onEdit: (content: string) => void;
  onEditAction: (action: string) => void;
  onEditGiphy: (giphyId: string | null) => void;
  onDelete: () => void;
  landed?: boolean;
  onTouchPreview?: (intent: DropIntent | null) => void;
  onTouchDrop?: (clientX: number, clientY: number) => void;
}

const hoverActions =
  'max-md:opacity-100 md:pointer-events-none md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100';

const PostItem = ({
  post,
  color,
  onLike,
  onDislike,
  onCancelVotes,
  onReact,
  onEdit,
  onEditAction,
  onEditGiphy,
  onDelete,
  landed = false,
  onTouchPreview,
  onTouchDrop,
}: PostItemProps) => {
  const {
    canCreateAction,
    canEdit,
    canDelete,
    canUpVote,
    canDownVote,
    canDisplayUpVote,
    canDisplayDownVote,
    canCancelVote,
    canShowAuthor,
    canReorder,
    canUseGiphy,
    canReact,
    isBlurred,
  } = usePostUserPermissions(post);
  const user = useUser();
  const { t } = useTranslation();
  const { encrypt, decrypt } = useCrypto();
  const canDecrypt = useCanDecrypt();
  const [giphyImageUrl, showGiphyImage, toggleShowGiphyImage] = useGiphy(
    post.giphy,
  );
  const cardRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const onTouchDropRef = useRef(onTouchDrop);
  onTouchDropRef.current = onTouchDrop;
  const onTouchPreviewRef = useRef(onTouchPreview);
  onTouchPreviewRef.current = onTouchPreview;
  const [dragging, setDragging] = useState(false);
  const [actionsToggled, toggleAction] = useToggle(false);
  const [showGiphyEditor, setShowGiphyEditor] = useState(false);
  const confirm = useConfirm();

  const upVotes = useMemo(() => countVotes(post, 'like'), [post]);
  const downVotes = useMemo(() => countVotes(post, 'dislike'), [post]);
  const upVoters = useMemo(() => enumerateVotes(post, 'like'), [post]);
  const downVoters = useMemo(() => enumerateVotes(post, 'dislike'), [post]);
  const upVotedByMe = useMemo(
    () => !!user && post.votes.some((v) => v.type === 'like' && v.userId === user.id),
    [post.votes, user],
  );
  const downVotedByMe = useMemo(
    () =>
      !!user &&
      post.votes.some((v) => v.type === 'dislike' && v.userId === user.id),
    [post.votes, user],
  );
  const displayAction = actionsToggled || !!post.action;
  const readOnly = !canEdit || isBlurred || !canDecrypt;
  const handleShowGiphy = useCallback(() => {
    setShowGiphyEditor(true);
    trackEvent('game/post/giphy/open');
  }, []);
  const handleHideGiphyEditor = useCallback(() => {
    setShowGiphyEditor(false);
  }, []);
  const handleChooseGiphyEditor = useCallback(
    (giphyItem: { id: string }) => {
      onEditGiphy(giphyItem.id);
      trackEvent('game/post/giphy/choose');
    },
    [onEditGiphy],
  );

  const handleEdit = useCallback(
    (postContent: string) => {
      onEdit(encrypt(postContent));
    },
    [onEdit, encrypt],
  );
  const handleEditAction = useCallback(
    (action: string) => {
      onEditAction(encrypt(action));
    },
    [onEditAction, encrypt],
  );
  const handleDelete = useCallback(() => {
    confirm({
      title: t('PostBoard.deleteConfirmation.title'),
      description: t('PostBoard.deleteConfirmation.description'),
      confirmationText: t('PostBoard.deleteConfirmation.confirm'),
      cancellationText: t('PostBoard.deleteConfirmation.cancel'),
      confirmationButtonProps: {
        color: 'error',
        'data-cy': 'delete-post-confirm',
      },
    }).then(() => {
      onDelete();
      trackEvent('game/post/delete');
    });
  }, [onDelete, confirm, t]);

  const actualContent = useMemo(() => {
    return isBlurred ? generateLoremIpsum(post.content) : decrypt(post.content);
  }, [decrypt, isBlurred, post.content]);

  useEffect(() => {
    const element = cardRef.current;
    if (!element) {
      return;
    }
    const cleanups: Array<() => void> = [];
    const handle = handleRef.current;
    if (canReorder && handle) {
      cleanups.push(
        draggable({
          element,
          dragHandle: handle,
          getInitialData: () => ({ type: 'post', postId: post.id }),
          onDragStart: () => setDragging(true),
          onDrop: () => setDragging(false),
        }),
        bindTouchDrag(handle, {
          card: element,
          onDragging: setDragging,
          onPreview: (intent) => {
            onTouchPreviewRef.current?.(intent);
          },
          onDrop: (clientX, clientY) => {
            onTouchDropRef.current?.(clientX, clientY);
          },
        }),
      );
    }
    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }, [canReorder, post.id]);

  return (
    <div
      ref={cardRef}
      data-post-id={post.id}
      className={`group relative mb-4 overflow-hidden rounded-2xl border border-line bg-cream shadow-card${canReorder ? ' post-with-handle' : ''}${landed ? ' post-landed' : ''}`}
      style={
        {
          opacity: dragging ? 0.4 : undefined,
          transformOrigin: landed ? 'center' : undefined,
          '--post-color': color,
        } as React.CSSProperties
      }
    >
      {isBlurred ? (
        <style>{`
          .retro-post-blurred > * { display: none; }
          .retro-post-blurred::before { content: '(hidden for now)'; }
          @supports (backdrop-filter: blur(3px)) or (-webkit-backdrop-filter: blur(3px)) {
            .retro-post-blurred > * { display: block; }
            .retro-post-blurred::before { content: unset; }
          }
        `}</style>
      ) : null}
      {isBlurred ? (
        <Tooltip content="Cards from other people will be shown when the moderator chooses to reveal them.">
          <div className="absolute inset-0 z-[2] bg-white/90 backdrop-blur-[3px] supports-[backdrop-filter]:bg-white/30" />
        </Tooltip>
      ) : null}
      {canReorder ? (
        <div
          ref={handleRef}
          data-cy="drag-handle"
          className={`drag-handle absolute top-3 right-1 z-[1] flex cursor-grab touch-none select-none items-center justify-center text-muted transition-opacity ${hoverActions}`}
        >
          <GripVertical className="size-4" />
        </div>
      ) : null}
      <div className="post-copy px-4 py-3 pr-8 text-sm">
        <div className={isBlurred ? 'retro-post-blurred' : undefined}>
          <EditableLabel
            wrapText
            readOnly={readOnly}
            value={actualContent}
            onChange={handleEdit}
            label="Post content"
            multiline
          />
        </div>
        {canShowAuthor && (
          <div className="mt-2 flex justify-end text-xs">
            <span className="text-muted">{t('Post.by')}&nbsp;</span>
            <span>{post.user.name}</span>
          </div>
        )}
      </div>
      {giphyImageUrl && showGiphyImage && (
        <div className="relative">
          <button
            type="button"
            onClick={toggleShowGiphyImage}
            aria-label={t('Post.closeExtra')}
            className="absolute top-2 right-2 inline-flex size-5 items-center justify-center rounded-full bg-red-400 text-white"
          >
            <X className="size-3" />
          </button>
          <img
            src={giphyImageUrl}
            alt="Giphy"
            className="h-[200px] w-full object-cover"
          />
        </div>
      )}
      {displayAction && canCreateAction && (
        <div className="border-t border-line bg-paper px-4 py-3 text-sm">
          <p className="text-xs text-blue-400">{t('Actions.title')}:</p>
          <EditableLabel
            wrapText
            value={decrypt(post.action || '')}
            onChange={handleEditAction}
            label={t('Actions.title')!}
            focused={actionsToggled && !post.action}
            multiline
          />
        </div>
      )}
      <ActionsBar
        left={
          <>
            {canDisplayUpVote ? (
              <VoteButton
                voters={upVoters}
                canVote={canUpVote}
                votedByMe={upVotedByMe}
                count={upVotes}
                emoji="👍"
                onClick={onLike}
                showTooltip={canShowAuthor}
                ariaLabel="Like"
              />
            ) : null}
            {canDisplayDownVote ? (
              <VoteButton
                voters={downVoters}
                canVote={canDownVote}
                votedByMe={downVotedByMe}
                count={downVotes}
                emoji="👎"
                onClick={onDislike}
                showTooltip={canShowAuthor}
                ariaLabel="Dislike"
              />
            ) : null}
            <ReactionBar
              reactions={post.reactions}
              currentUserId={user?.id ?? null}
              canReact={canReact}
              showNames={canShowAuthor}
              onToggle={onReact}
            />
          </>
        }
        rightActions={
          <>
            {canCancelVote ? (
              <ActionButton
                icon={
                  <X className="size-5" style={{ color: Palette.negative }} />
                }
                tooltip={t('Post.cancelVote')!}
                ariaLabel={t('Post.cancelVote')}
                onClick={onCancelVotes}
              />
            ) : null}
            {giphyImageUrl && (
              <ActionButton
                ariaLabel={t('Post.toggleGiphyButton')}
                tooltip={t('Post.toggleGiphyButton')!}
                icon={
                  <Image
                    className="size-5"
                    style={{
                      color: !showGiphyImage ? '#a5d6a7' : '#ef9a9a',
                    }}
                  />
                }
                onClick={toggleShowGiphyImage}
              />
            )}
            {canCreateAction && (
              <ActionButton
                ariaLabel={t('Post.setActionButton')}
                tooltip={t('Post.setActionButton')!}
                icon={
                  <SquareCheck
                    className="size-5 text-blue-400"
                    style={{ opacity: post.action ? 1 : 0.55 }}
                  />
                }
                onClick={toggleAction}
              />
            )}
            {canEdit && !!config.GIPHY_API_KEY && canUseGiphy && (
              <Popover
                open={showGiphyEditor}
                onOpenChange={(next) => {
                  if (next) {
                    handleShowGiphy();
                  } else {
                    handleHideGiphyEditor();
                  }
                }}
              >
                <Tooltip content={t('Post.setGiphyButton')!} side="bottom">
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label={t('Post.setGiphyButton')}
                      tabIndex={-1}
                      className="inline-flex size-8 items-center justify-center rounded-full text-yellow-700 hover:bg-ink/8"
                    >
                      <Smile className="size-5" />
                    </button>
                  </PopoverTrigger>
                </Tooltip>
                <PopoverContent align="start" className="w-auto p-2">
                  <GiphySearchBox
                    apiKey={config.GIPHY_API_KEY}
                    onSelect={handleChooseGiphyEditor}
                  />
                </PopoverContent>
              </Popover>
            )}
            {canDelete && (
              <ActionButton
                ariaLabel={t('Post.deleteButton')}
                tooltip={t('Post.deleteButton')!}
                icon={
                  <Trash2 className="size-5" style={{ color: Palette.negative }} />
                }
                onClick={handleDelete}
              />
            )}
          </>
        }
      />
    </div>
  );
};

function generateLoremIpsum(originalText: string) {
  const count = originalText.split(' ').length;
  return getLorem(count);
}

export default PostItem;
