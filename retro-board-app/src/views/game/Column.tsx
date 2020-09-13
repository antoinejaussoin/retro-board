import React, { SFC, useState, useCallback } from 'react';
import styled from 'styled-components';
import {
  Input,
  InputAdornment,
  makeStyles,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import { CreateNewFolder } from '@material-ui/icons';
import PostItem from './post/Post';
import { Post, PostGroup, SessionOptions } from 'retro-board-common';
import useUser from '../../auth/useUser';
import useTranslations from '../../translations';
import Group from './Group';
import {
  Droppable,
  DroppableProvided,
  DroppableStateSnapshot,
} from 'react-beautiful-dnd';
import { ColumnContent } from './types';

interface ColumnProps {
  column: ColumnContent;
  posts: Post[];
  groups: PostGroup[];
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>> | null;
  question: string;
  color: string;
  options: SessionOptions;
  onAdd: (content: string) => void;
  onAddGroup: () => void;
  onEditGroup: (group: PostGroup) => void;
  onDeleteGroup: (group: PostGroup) => void;
  onLike: (post: Post) => void;
  onDislike: (post: Post) => void;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
}

const useStyles = makeStyles({
  icon: {
    color: 'grey',
  },
});

const Column: SFC<ColumnProps> = ({
  column,
  options,
  posts,
  groups,
  icon: Icon,
  question,
  color,
  onAdd,
  onAddGroup,
  onLike,
  onDislike,
  onEdit,
  onDelete,
  onEditGroup,
  onDeleteGroup,
}) => {
  const user = useUser();
  const isLoggedIn = !!user;
  const { Column: columnTranslations } = useTranslations();
  const [content, setContent] = useState('');
  const onContentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setContent(e.target.value),
    [setContent]
  );
  const classes = useStyles();
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.keyCode === 13 && content) {
        onAdd(content);
        setContent('');
      }
    },
    [onAdd, setContent, content]
  );
  return (
    <ColumnWrapper>
      <Add>
        <Input
          placeholder={question}
          onChange={onContentChange}
          value={content}
          onKeyDown={onKeyDown}
          readOnly={!isLoggedIn}
          startAdornment={
            Icon ? (
              <InputAdornment position="start">
                <Icon className={classes.icon} />
              </InputAdornment>
            ) : null
          }
        />
        {options.allowGrouping && isLoggedIn ? (
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
`;

export default Column;
