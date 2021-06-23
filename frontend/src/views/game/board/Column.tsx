import { useState, useCallback } from 'react';
import styled from 'styled-components';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import grey from '@material-ui/core/colors/grey';
import { CreateNewFolder, SubdirectoryArrowLeft } from '@material-ui/icons';
import PostItem from './post/Post';
import { Post, PostGroup } from '@retrospected/common';
import useTranslations from '../../../translations';
import Group from './Group';
import {
  Droppable,
  DroppableProvided,
  DroppableStateSnapshot,
} from 'react-beautiful-dnd';
import { ColumnContent } from '../types';
import useCrypto from '../../../crypto/useCrypto';
import useQuota from '../../../hooks/useQuota';
import { deepPurple } from '@material-ui/core/colors';
import useSessionUserPermissions from './useSessionUserPermissions';

interface ColumnProps {
  column: ColumnContent;
  posts: Post[];
  groups: PostGroup[];
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>> | null;
  question: string;
  color: string;
  search: string;
  onAdd: (content: string) => void;
  onAddGroup: () => void;
  onEditGroup: (group: PostGroup) => void;
  onDeleteGroup: (group: PostGroup) => void;
  onLike: (post: Post) => void;
  onDislike: (post: Post) => void;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
}

const Column: React.FC<ColumnProps> = ({
  column,
  posts,
  groups,
  icon: Icon,
  question,
  color,
  search,
  onAdd,
  onAddGroup,
  onLike,
  onDislike,
  onEdit,
  onDelete,
  onEditGroup,
  onDeleteGroup,
}) => {
  const { Column: columnTranslations } = useTranslations();
  const [content, setContent] = useState('');
  const { encrypt } = useCrypto();
  const permissions = useSessionUserPermissions();
  const { increment } = useQuota();
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
    <ColumnWrapper>
      <Add>
        <Input
          placeholder={question}
          onChange={onContentChange}
          value={content}
          onKeyDown={handleAddKeyboard}
          readOnly={!permissions.canCreatePost}
          startAdornment={
            Icon ? (
              <InputAdornment position="start">
                <Icon style={{ color: grey[500] }} />
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
        />
        {permissions.canCreateGroup ? (
          <AddGroup>
            <Tooltip title={columnTranslations.createGroupTooltip!}>
              <IconButton onClick={onAddGroup} tabIndex={-1}>
                <CreateNewFolder />
              </IconButton>
            </Tooltip>
          </AddGroup>
        ) : null}
      </Add>
      <Groups>
        {groups.map((group) => (
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
            {group.posts.map((post, index) => (
              <PostItem
                index={index}
                key={post.id}
                post={post}
                search={search}
                color={color}
                onLike={() => onLike(post)}
                onDislike={() => onDislike(post)}
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
          </Group>
        ))}
      </Groups>
      <Droppable droppableId={'column#' + column.index} isCombineEnabled>
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
            {posts.map((post, index) => (
              <PostItem
                index={index}
                key={post.id}
                post={post}
                search={search}
                color={color}
                onLike={() => onLike(post)}
                onDislike={() => onDislike(post)}
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

  > :first-child {
    flex: 1;
    input {
      width: 100%;
    }
  }
`;

const AddGroup = styled.div`
  position: relative;
  top: 3px;
  border-left: 1px solid ${grey[300]};
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
    color: ${grey[500]};
  }
  :hover {
    > * {
      color: ${deepPurple[500]};
    }
  }

  @media (max-width: 600px) {
    display: none;
    visibility: hidden;
  }
`;

export default Column;
