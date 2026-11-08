import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { PostGroup } from 'common';
import { ChevronDown, ChevronRight, MessageCircle, Trash2 } from 'lucide-react';
import { type PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EditableLabel from '../../../components/EditableLabel';
import useCrypto from '../../../crypto/useCrypto';
import { cn } from 'ui/cn';
import { Alert } from 'ui/alert';
import { IconButton } from 'ui/icon-button';
import { isPostDragData, subscribeDragOver } from './drag';

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
    [onEditLabel, encrypt],
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
  useEffect(() => {
    const id = `group#${group.id}`;
    return subscribeDragOver((targetId) => {
      setDraggingOver(targetId === id);
    });
  }, [group.id]);
  return (
    <div
      ref={containerRef}
      data-drop-id={`group#${group.id}`}
      className={cn(
        'relative my-2.5 flex flex-col rounded-xl border border-dashed border-line',
        draggingOver && 'bg-gray-200',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-1',
          collapsed ? 'bg-paper px-2.5 py-1 text-muted' : 'bg-gray-100 px-2.5 py-2',
        )}
      >
        <div className="ml-2 min-w-0 flex-1">
          <EditableLabel
            wrapText
            value={decrypt(group.label)}
            onChange={handleEditLabel}
            readOnly={readonly}
          />
        </div>
        <div className="flex items-center">
          {collapsed ? (
            <span className="relative mr-2 inline-flex">
              <MessageCircle className="size-5" />
              <span
                className={cn(
                  'absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium text-white',
                  group.posts.length ? 'bg-primary-700' : 'bg-secondary-600',
                )}
              >
                {group.posts.length}
              </span>
            </span>
          ) : null}
          {!collapsed ? (
            <IconButton
              onClick={handleDelete}
              aria-label="Delete group"
              className="size-9"
            >
              <Trash2 className="size-4" />
            </IconButton>
          ) : null}
          <IconButton
            onClick={toggleCollapse}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand group' : 'Collapse group'}
            className="size-9"
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </IconButton>
        </div>
      </div>
      {!collapsed ? (
        <div className="flex min-h-[100px] flex-col">
          <div>{children}</div>
          {group.posts.length === 0 ? (
            <div className="m-6">
              <Alert severity="info" title={t('Group.emptyGroupTitle')}>
                {t('Group.emptyGroupContent')}
              </Alert>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
