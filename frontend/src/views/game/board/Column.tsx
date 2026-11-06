import { useState, useCallback, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { colors } from '@mui/material';
import { CreateNewFolder, SubdirectoryArrowLeft } from '@mui/icons-material';
import PostItem from './post/Post';
import { Post, PostGroup } from 'common';
import { useTranslation } from 'react-i18next';
import Group from './Group';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { isPostDragData } from './drag';
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
  const postsRef = useRef<HTMLDivElement>(null);
  const [draggingOver, setDraggingOver] = useState(false);
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

  return (
    <ColumnWrapper>
      <Add>
        <Input
          placeholder={question}
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
          inputProps={{ 'data-cy': 'column-input' }}
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
              {posts.map((post) => (
                <PostItem
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
      <PostsWrapper
        ref={postsRef}
        draggingOver={draggingOver}
        draggingColor={column.color}
      >
        {posts.filter(searchPredicate).map((post) => (
          <PostItem
            key={post.id}
            post={post}
            color={color}
            combine={permissions.canReorderPosts}
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
    </ColumnWrapper>
  );
};

function isEnter(code: string) {
  return code === 'Enter' || code === 'NumpadEnter';
}

const ColumnWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-bottom: 10px;
  padding: 0 5px;
`;

const PostsWrapper = styled.div<{
  draggingOver: boolean;
  draggingColor: string;
}>`
  background-color: ${(props) =>
    props.draggingOver ? props.draggingColor : 'unset'};
  flex: 1;
  min-height: 100px;
`;

const Groups = styled.div``;

const Add = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
  left: 10px;

  > :first-of-type {
    flex: 1;
    input {
      width: 100%;
    }
  }
`;

const AddGroup = styled.div`
  position: relative;
  top: 3px;
  border-left: 1px solid ${colors.grey[300]};
  margin-left: 12px;
  height: 25px;
  display: flex;
  align-items: center;
  > * {
    position: relative;
    top: -2px;
  }
`;

const EnterIcon = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  > * {
    color: ${colors.grey[500]};
  }
  :hover {
    > * {
      color: ${colors.deepPurple[500]};
    }
  }
`;

const IconContainer = styled.div`
  position: relative;
  top: 4px;
`;

export default Column;
