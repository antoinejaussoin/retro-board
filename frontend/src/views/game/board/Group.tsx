import { PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import { PostGroup } from 'common';
import styled from '@emotion/styled';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { isPostDragData } from './drag';
import { colors } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import {
  Delete,
  KeyboardArrowDown,
  KeyboardArrowRight,
  Message,
} from '@mui/icons-material';
import EditableLabel from '../../../components/EditableLabel';
import { Alert, AlertTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';
import useCrypto from '../../../crypto/useCrypto';
import { Badge } from '@mui/material';

interface GroupProps {
  group: PostGroup;
  readonly: boolean;
  onEditLabel: (label: string) => void;
  onDelete: (group: PostGroup) => void;
}

export default function Group({
  group,
  onEditLabel,
  onDelete,
  readonly,
  children,
}: PropsWithChildren<GroupProps>) {
  const { t } = useTranslation();
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingOver, setDraggingOver] = useState(false);
  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }
    return dropTargetForElements({
      element,
      canDrop: ({ source }) => isPostDragData(source.data),
      getData: () => ({ type: 'group', targetId: `group#${group.id}` }),
      onDragEnter: () => setDraggingOver(true),
      onDragLeave: () => setDraggingOver(false),
      onDrop: () => setDraggingOver(false),
    });
  }, [group.id]);
  return (
        <GroupContainer
          ref={containerRef}
          draggingOver={draggingOver}
        >
          <Header collapsed={collapsed}>
            <Label>
              <EditableLabel
                wrapText
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
                <IconButton onClick={handleDelete} size="large">
                  <Delete />
                </IconButton>
              ) : null}
              <IconButton onClick={toggleCollapse} size="large">
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
                    <AlertTitle>{t('Group.emptyGroupTitle')}</AlertTitle>
                    {t('Group.emptyGroupContent')}
                  </Alert>
                </NoPosts>
              ) : null}
            </Content>
          ) : null}
        </GroupContainer>
  );
}

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

const Header = styled.div<{ collapsed: boolean }>`
  display: flex;
  align-items: center;
  background-color: ${(props) =>
    props.collapsed ? colors.grey[50] : colors.grey[100]};
  padding: ${(props) => (props.collapsed ? '3px 10px' : '10px')};
  color: ${(props) => (props.collapsed ? colors.grey[500] : 'inherit')};
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
