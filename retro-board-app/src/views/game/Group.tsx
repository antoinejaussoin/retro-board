import React from 'react';
import { PostGroup } from 'retro-board-common';
import styled from 'styled-components';
import {
  Droppable,
  DroppableProvided,
  DroppableStateSnapshot,
} from 'react-beautiful-dnd';
import { colors, IconButton } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import EditableLabel from '../../components/EditableLabel';
import { Alert, AlertTitle } from '@material-ui/lab';
import useTranslations from '../../translations';

interface GroupProps {
  group: PostGroup;
  readonly: boolean;
  onEditLabel: (label: string) => void;
  onDelete: (group: PostGroup) => void;
}

const Group: React.FC<GroupProps> = ({
  group,
  onEditLabel,
  onDelete,
  readonly,
  children,
}) => {
  const { Group: groupTranslations } = useTranslations();
  return (
    <Droppable droppableId={'group#' + group.id} key={group.id} mode="standard">
      {(
        dropProvided: DroppableProvided,
        dropSnapshot: DroppableStateSnapshot
      ) => (
        <GroupContainer
          ref={dropProvided.innerRef}
          {...dropProvided.droppableProps}
          draggingOver={dropSnapshot.isDraggingOver}
        >
          <Header>
            <Label>
              <EditableLabel
                value={group.label}
                onChange={onEditLabel}
                readOnly={readonly}
              />
            </Label>
            <DeleteContainer>
              <IconButton onClick={() => onDelete(group)}>
                <Delete />
              </IconButton>
            </DeleteContainer>
          </Header>
          <Content>
            <div>{children}</div>
            {group.posts.length === 0 ? (
              <NoPosts>
                <Alert severity="info">
                  <AlertTitle>{groupTranslations.emptyGroupTitle}</AlertTitle>
                  {groupTranslations.emptyGroupContent}
                </Alert>
              </NoPosts>
            ) : null}
          </Content>
        </GroupContainer>
      )}
    </Droppable>
  );
};

const GroupContainer = styled.div<{ draggingOver: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px dashed lightgray;
  border-radius: 10px;
  margin: 10px 0;
  background-color: ${(props) =>
    props.draggingOver ? colors.grey[200] : 'unset'};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  background-color: ${colors.grey[100]};
  padding: 10px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100px;
`;

const Label = styled.div`
  margin-left: 30px;
  flex: 1;
`;

const DeleteContainer = styled.div``;

const NoPosts = styled.div`
  justify-self: center;
  color: grey;
  margin: 30px;
`;

export default Group;
