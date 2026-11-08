import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Post, PostGroup } from 'common';
import { CornerDownLeft, FolderPlus } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from 'ui/cn';
import { IconButton } from 'ui/icon-button';
import { Input } from 'ui/input';
import { Tooltip } from 'ui/tooltip';
import useCrypto from '../../../crypto/useCrypto';
import useQuota from '../../../hooks/useQuota';
import { useSearch } from '../is-search-match';
import { ColumnContent } from '../types';
import Group from './Group';
import {
  getDragFrame,
  isPostDragData,
  rowsForPreview,
  subscribeDragFrame,
  type DropIntent,
} from './drag';
import { useFlip } from './useFlip';
import PostItem from './post/Post';
import useSessionUserPermissions from './useSessionUserPermissions';

interface ColumnProps {
  column: ColumnContent;
  posts: Post[];
  groups: PostGroup[];
  icon: React.ReactElement | null;
  question: string;
  color: string;
  search: string;
  onAdd: (content: string) => void;
  onAddGroup: () => void;
  onEditGroup: (group: PostGroup) => void;
  onDeleteGroup: (group: PostGroup) => void;
  onLike: (post: Post) => void;
  onDislike: (post: Post) => void;
  onCancelVotes: (post: Post) => void;
  onReact: (post: Post, emoji: string) => void;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
  onTouchPreview: (intent: DropIntent | null) => void;
  onTouchDrop: (postId: string, clientX: number, clientY: number) => void;
  fillViewport?: boolean;
}

const Column: React.FC<ColumnProps> = ({
  column,
  posts,
  groups,
  icon,
  question,
  color,
  search,
  onAdd,
  onAddGroup,
  onLike,
  onDislike,
  onCancelVotes,
  onReact,
  onEdit,
  onDelete,
  onEditGroup,
  onDeleteGroup,
  onTouchPreview,
  onTouchDrop,
  fillViewport = false,
}) => {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const { encrypt } = useCrypto();
  const permissions = useSessionUserPermissions();
  const postsRef = useRef<HTMLDivElement>(null);
  const [draggingOver, setDraggingOver] = useState(false);
  const { increment } = useQuota();
  const searchPredicate = useSearch(search);
  const onContentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setContent(e.target.value),
    [setContent],
  );

  const handleAdd = useCallback(() => {
    increment();
    onAdd(encrypt(content));
    setContent('');
  }, [increment, onAdd, setContent, encrypt, content]);

  const handleAddKeyboard = useCallback(
    (e: React.KeyboardEvent) => {
      if (isEnter(e.code) && content) {
        handleAdd();
      }
    },
    [handleAdd, content],
  );

  const handleAddButton = useCallback(() => {
    if (content) {
      handleAdd();
    }
  }, [handleAdd, content]);

  useEffect(() => {
    const element = postsRef.current;
    if (!element) {
      return;
    }
    return dropTargetForElements({
      element,
      canDrop: ({ source }) =>
        permissions.canReorderPosts && isPostDragData(source.data),
      getData: () => ({ type: 'column', targetId: `column#${column.index}` }),
      onDragEnter: () => setDraggingOver(true),
      onDragLeave: () => setDraggingOver(false),
      onDrop: () => setDraggingOver(false),
    });
  }, [column.index, permissions.canReorderPosts]);

  const frame = useSyncExternalStore(
    subscribeDragFrame,
    getDragFrame,
    getDragFrame,
  );
  const columnId = `column#${column.index}`;
  const columnPosts = posts.filter(searchPredicate);
  const columnRows = rowsForPreview(columnPosts, frame.preview, columnId);
  const columnSignature = columnRows
    .map((row) => (row.kind === 'slot' ? 'slot' : row.post.id))
    .join('|');
  useFlip(postsRef, columnSignature);

  const renderList = (items: Post[], listId: string) =>
    rowsForPreview(items, frame.preview, listId).map((row) => {
      if (row.kind === 'slot') {
        return (
          <div
            key="slot"
            data-flip-id={`slot:${listId}`}
            className="mb-4 rounded-2xl border-2 border-dashed border-primary-400 bg-primary-50/80"
            style={{ height: frame.height }}
          />
        );
      }
      return (
        <div
          key={row.post.id}
          data-flip-id={row.collapsed ? undefined : row.post.id}
          className={row.collapsed ? 'h-0 overflow-hidden' : undefined}
          aria-hidden={row.collapsed || undefined}
        >
          <PostItem
            post={row.post}
            color={color}
            landed={frame.landedId === row.post.id}
            onLike={() => onLike(row.post)}
            onDislike={() => onDislike(row.post)}
            onDelete={() => onDelete(row.post)}
            onCancelVotes={() => onCancelVotes(row.post)}
            onReact={(emoji) => onReact(row.post, emoji)}
            onEdit={(content) =>
              onEdit({
                ...row.post,
                content,
              })
            }
            onEditAction={(action) =>
              onEdit({
                ...row.post,
                action,
              })
            }
            onEditGiphy={(giphy) =>
              onEdit({
                ...row.post,
                giphy,
              })
            }
            onTouchPreview={onTouchPreview}
            onTouchDrop={(clientX, clientY) =>
              onTouchDrop(row.post.id, clientX, clientY)
            }
          />
        </div>
      );
    });

  return (
    <section
      className={cn(
        'flex min-w-0 flex-col py-3',
        fillViewport ? 'min-h-40' : 'min-h-[calc(100dvh-7rem)]',
      )}
    >
      <div className="mb-4 flex items-center gap-1">
        <div className="relative min-w-0 flex-1">
          {icon ? (
            <span className="pointer-events-none absolute top-1/2 left-2.5 flex size-6 -translate-y-1/2 items-center justify-center">
              {icon}
            </span>
          ) : null}
          <Input
            placeholder={question}
            onChange={onContentChange}
            value={content}
            onKeyDown={handleAddKeyboard}
            readOnly={!permissions.canCreatePost}
            data-cy="column-input"
            className={cn('pr-10', icon && 'pl-11')}
          />
          <button
            type="button"
            onClick={handleAddButton}
            aria-label="Add post"
            className="absolute top-1/2 right-1 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:text-primary-600"
          >
            <CornerDownLeft className="size-4" />
          </button>
        </div>
        {permissions.canCreateGroup ? (
          <Tooltip content={t('Column.createGroupTooltip')} side="bottom">
            <IconButton
              onClick={onAddGroup}
              tabIndex={-1}
              aria-label={t('Column.createGroupTooltip')}
              className="size-9"
            >
              <FolderPlus className="size-5" />
            </IconButton>
          </Tooltip>
        ) : null}
      </div>
      <div>
        {groups.map((group) => {
          const grouped = group.posts.filter(searchPredicate);
          if (search && grouped.length === 0) {
            return null;
          }
          const groupId = `group#${group.id}`;
          const flipKey = rowsForPreview(grouped, frame.preview, groupId)
            .map((row) => (row.kind === 'slot' ? 'slot' : row.post.id))
            .join('|');
          return (
            <Group
              key={group.id}
              group={group}
              flipKey={flipKey}
              readonly={false}
              onEditLabel={(label) =>
                onEditGroup({
                  ...group,
                  label,
                })
              }
              onDelete={() => onDeleteGroup(group)}
            >
              {renderList(grouped, groupId)}
            </Group>
          );
        })}
      </div>
      <div
        ref={postsRef}
        data-drop-id={`column#${column.index}`}
        className="min-h-[100px] flex-1 rounded-xl pb-20"
        style={{
          backgroundColor:
            draggingOver || frame.preview?.targetId === columnId
              ? column.color
              : undefined,
        }}
      >
        {renderList(columnPosts, columnId)}
      </div>
    </section>
  );
};

function isEnter(code: string) {
  return code === 'Enter' || code === 'NumpadEnter';
}

export default Column;
