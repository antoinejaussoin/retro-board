import { useCallback, useState } from 'react';
import { PostGroup } from '@retrospected/common';
import styled from 'styled-components';
import {
  Droppable,
  DroppableProvided,
  DroppableStateSnapshot,
} from 'react-beautiful-dnd';
import grey from '@material-ui/core/colors/grey';
import IconButton from '@material-ui/core/IconButton';
import {
  Delete,
  KeyboardArrowDown,
  KeyboardArrowRight,
  Message,
} from '@material-ui/icons';
import EditableLabel from '../../../components/EditableLabel';
import { Alert, AlertTitle } from '@material-ui/lab';
import useTranslations from '../../../translations';
import useCrypto from '../../../crypto/useCrypto';
import { Badge } from '@material-ui/core';

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
  const [collapsed, setCollapsed] = useState(false);
  const { decrypt, encrypt } = useCrypto();
  const handleEditLabel = useCallback(
    (label: string) => {
      onEditLabel(encrypt(label));
    },
    [onEditLabel, encrypt]
  );
  const handleDelete = useCallback(() => {
    onDelete(group);
  }, [onDelete, group]);
  const toggleCollapse = useCallback(() => {
    setCollapsed((c) => !c);
  }, []);
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
          <Header collapsed={collapsed}>
            <Label>
              <EditableLabel
                value={decrypt(group.label)}
                onChange={handleEditLabel}
                readOnly={readonly}
              />
            </Label>
            <ActionsContainer>
              {collapsed ? (
                <Badge
                  badgeContent={group.posts.length.toString()}
                  color={group.posts.length ? 'primary' : 'secondary'}
                  style={{ marginRight: 10 }}
                >
                  <Message />
                </Badge>
              ) : null}
              {!collapsed ? (
                <IconButton onClick={handleDelete}>
                  <Delete />
                </IconButton>
              ) : null}
              <IconButton onClick={toggleCollapse}>
                {collapsed ? <KeyboardArrowRight /> : <KeyboardArrowDown />}
              </IconButton>
            </ActionsContainer>
          </Header>
          {!collapsed ? (
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
          ) : null}
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
  background-color: ${(props) => (props.draggingOver ? grey[200] : 'unset')};
`;

const Header = styled.div<{ collapsed: boolean }>`
  display: flex;
  align-items: center;
  background-color: ${(props) => (props.collapsed ? grey[50] : grey[100])};
  padding: ${(props) => (props.collapsed ? '3px 10px' : '10px')};
  color: ${(props) => (props.collapsed ? grey[500] : 'inherit')};
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

const ActionsContainer = styled.div``;

const NoPosts = styled.div`
  justify-self: center;
  color: grey;
  margin: 30px;
`;

export default Group;
