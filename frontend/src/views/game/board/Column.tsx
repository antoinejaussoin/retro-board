import { useState, useCallback } from 'react';
import styled from '@emotion/styled';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { CreateNewFolder, SubdirectoryArrowLeft } from '@mui/icons-material';
import PostItem from './post/Post';
import { Post, PostGroup } from 'common';
import { useTranslation } from 'react-i18next';
import Group from './Group';
import {
  Droppable,
  DroppableProvided,
  DroppableStateSnapshot,
} from '@hello-pangea/dnd';
import { ColumnContent } from '../types';
import useCrypto from '../../../crypto/useCrypto';
import useQuota from '../../../hooks/useQuota';
import useSessionUserPermissions from './useSessionUserPermissions';
import { useSearch } from '../is-search-match';

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
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
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
  onEdit,
  onDelete,
  onEditGroup,
  onDeleteGroup,
}) => {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const { encrypt } = useCrypto();
  const permissions = useSessionUserPermissions();
  const { increment } = useQuota();
  const searchPredicate = useSearch(search);
  const onContentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setContent(e.target.value),
    [setContent]
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
    [handleAdd, content]
  );

  const handleAddButton = useCallback(() => {
    if (content) {
      handleAdd();
    }
  }, [handleAdd, content]);

  return (
    <ColumnWrapper $color={color}>
      <ColumnHeading>
        <ColorDot $color={color} />
        <ColumnTitle>{question}</ColumnTitle>
      </ColumnHeading>
      <Add>
        <Input
          disableUnderline
          placeholder=""
          onChange={onContentChange}
          value={content}
          onKeyDown={handleAddKeyboard}
          readOnly={!permissions.canCreatePost}
          startAdornment={
            icon ? (
              <InputAdornment position="start">
                <IconContainer>{icon}</IconContainer>
              </InputAdornment>
            ) : null
          }
          endAdornment={
            <InputAdornment position="end">
              <EnterIcon onClick={handleAddButton}>
                <SubdirectoryArrowLeft />
              </EnterIcon>
            </InputAdornment>
          }
          inputProps={{ 'data-cy': 'column-input', 'aria-label': question }}
        />
        {permissions.canCreateGroup ? (
          <AddGroup>
            <Tooltip title={t('Column.createGroupTooltip')}>
              <IconButton onClick={onAddGroup} tabIndex={-1} size="large">
                <CreateNewFolder />
              </IconButton>
            </Tooltip>
          </AddGroup>
        ) : null}
      </Add>
      <Groups>
        {groups.map((group) => {
          const posts = group.posts.filter(searchPredicate);
          if (search && posts.length === 0) {
            return null;
          }
          return (
            <Group
              key={group.id}
              group={group}
              readonly={false}
              onEditLabel={(label) =>
                onEditGroup({
                  ...group,
                  label,
                })
              }
              onDelete={() => onDeleteGroup(group)}
            >
              {posts.map((post, index) => (
                <PostItem
                  index={index}
                  key={post.id}
                  post={post}
                  color={color}
                  onLike={() => onLike(post)}
                  onDislike={() => onDislike(post)}
                  onDelete={() => onDelete(post)}
                  onCancelVotes={() => onCancelVotes(post)}
                  onEdit={(content) =>
                    onEdit({
                      ...post,
                      content,
                    })
                  }
                  onEditAction={(action) =>
                    onEdit({
                      ...post,
                      action,
                    })
                  }
                  onEditGiphy={(giphy) =>
                    onEdit({
                      ...post,
                      giphy,
                    })
                  }
                />
              ))}
            </Group>
          );
        })}
      </Groups>
      <Droppable
        droppableId={'column#' + column.index}
        isCombineEnabled
        isDropDisabled={!permissions.canReorderPosts}
      >
        {(
          dropProvided: DroppableProvided,
          dropSnapshot: DroppableStateSnapshot
        ) => (
          <PostsWrapper
            ref={dropProvided.innerRef}
            {...dropProvided.droppableProps}
            draggingOver={dropSnapshot.isDraggingOver}
            draggingColor={column.color}
          >
            {posts.filter(searchPredicate).map((post, index) => (
              <PostItem
                index={index}
                key={post.id}
                post={post}
                color={color}
                onLike={() => onLike(post)}
                onDislike={() => onDislike(post)}
                onCancelVotes={() => onCancelVotes(post)}
                onDelete={() => onDelete(post)}
                onEdit={(content) =>
                  onEdit({
                    ...post,
                    content,
                  })
                }
                onEditAction={(action) =>
                  onEdit({
                    ...post,
                    action,
                  })
                }
                onEditGiphy={(giphy) =>
                  onEdit({
                    ...post,
                    giphy,
                  })
                }
              />
            ))}
          </PostsWrapper>
        )}
      </Droppable>
    </ColumnWrapper>
  );
};

function isEnter(code: string) {
  return code === 'Enter' || code === 'NumpadEnter';
}

const ColumnWrapper = styled.div<{ $color: string }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin: 0 6px 10px;
  padding: 12px 10px 8px;
  border-radius: 12px;
  background-color: color-mix(
    in srgb,
    ${(props) => props.$color} 78%,
    var(--rs-canvas)
  );
  min-width: 0;
`;

const ColumnHeading = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 4px 10px;
`;

const ColorDot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 99px;
  flex: none;
  background: color-mix(in srgb, ${(props) => props.$color} 55%, #1c1917);
  box-shadow: inset 0 0 0 1px rgba(28, 25, 23, 0.12);
`;

const ColumnTitle = styled.h2`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.3;
`;

const PostsWrapper = styled.div<{
  draggingOver: boolean;
  draggingColor: string;
}>`
  background-color: ${(props) =>
    props.draggingOver
      ? `color-mix(in srgb, ${props.draggingColor} 45%, white)`
      : 'transparent'};
  border-radius: 10px;
  flex: 1;
  min-height: 100px;
  transition: background-color 0.15s ease;
`;

const Groups = styled.div``;

const Add = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 2px 4px;
  background: var(--rs-paper);
  border: 1px solid var(--rs-border);
  border-radius: 10px;

  > :first-of-type {
    flex: 1;
    input {
      width: 100%;
    }
  }
`;

const AddGroup = styled.div`
  border-left: 1px solid var(--rs-border);
  margin-left: 4px;
  height: 28px;
  display: flex;
  align-items: center;
`;

const EnterIcon = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  > * {
    color: var(--rs-muted);
  }
  :hover {
    > * {
      color: var(--rs-accent);
    }
  }
`;

const IconContainer = styled.div`
  position: relative;
  top: 4px;
`;

export default Column;
