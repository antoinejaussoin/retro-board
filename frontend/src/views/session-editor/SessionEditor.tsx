import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Columns3,
  LayoutTemplate,
  StickyNote,
  ThumbsUp,
  Timer,
} from 'lucide-react';
import type { AllSessionSettings, SessionOptions, User } from 'common';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'hooks/useMediaQuery';
import useToggle from '../../hooks/useToggle';
import { extrapolate, toColumnDefinitions } from '../../state/columns';
import type { ColumnSettings } from '../../state/types';
import { Button } from 'ui/button';
import { Checkbox } from 'ui/checkbox';
import { cn } from 'ui/cn';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from 'ui/dialog';
import BoardSection from './sections/board/BoardSection';
import PostsSection from './sections/posts/PostsSection';
import TemplateSection from './sections/template/TemplateSection';
import TimerSection from './sections/timer/TimerSection';
import VotingSection from './sections/votes/VotingSection';

interface SessionEditorProps {
  open: boolean;
  owner: User;
  settings: AllSessionSettings;
  onChange: (settings: AllSessionSettings, makeDefault: boolean) => void;
  onClose: () => void;
}

const categories = [
  { id: 'template', icon: LayoutTemplate, labelKey: 'Customize.template' },
  { id: 'board', icon: Columns3, labelKey: 'Customize.boardCategory' },
  { id: 'posts', icon: StickyNote, labelKey: 'Customize.postCategory' },
  { id: 'voting', icon: ThumbsUp, labelKey: 'Customize.votingCategory' },
  { id: 'timer', icon: Timer, labelKey: 'Customize.timerCategory' },
] as const;

function SessionEditor({
  open,
  owner,
  settings: originalSettings,
  onChange,
  onClose,
}: SessionEditorProps) {
  const { t } = useTranslation();
  const fullScreen = useMediaQuery('(max-width:600px)');
  const [isDefaultTemplate, toggleIsDefaultTemplate] = useToggle(false);
  const [settings, setSettings] = useState(originalSettings);
  const [currentTab, setCurrentTab] = useState('template');

  const extrapolatedColumns = useMemo(() => {
    const columns = settings.columns.map((column) => extrapolate(column, t));
    return columns;
  }, [settings.columns, t]);

  useEffect(() => {
    setSettings(originalSettings);
  }, [originalSettings]);

  const handleCreate = useCallback(() => {
    onChange(settings, isDefaultTemplate);
  }, [onChange, isDefaultTemplate, settings]);

  const handleOptionsChange = useCallback((options: SessionOptions) => {
    setSettings((prev) => ({ ...prev, options }));
  }, []);

  const handleSettingsChange = useCallback((options: AllSessionSettings) => {
    setSettings(options);
  }, []);

  const handleColumnsChanged = useCallback((columns: ColumnSettings[]) => {
    setSettings((prev) => ({ ...prev, columns: toColumnDefinitions(columns) }));
  }, []);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent
        size="xl"
        fullScreen={fullScreen}
        className="min-h-[min(70dvh,720px)]"
      >
        <DialogTitle>{t('Customize.title')}</DialogTitle>
        <div
          className={cn(
            'flex min-h-0 flex-1 overflow-hidden',
            fullScreen ? 'flex-col' : 'flex-row',
          )}
        >
          <nav
            aria-label={t('Customize.title')}
            className={cn(
              'flex gap-1',
              fullScreen
                ? 'overflow-x-auto border-b border-line px-4 py-2'
                : 'w-52 shrink-0 flex-col overflow-y-auto border-r border-line px-3 py-4',
            )}
          >
            {categories.map((category) => {
              const Icon = category.icon;
              const selected = currentTab === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setCurrentTab(category.id)}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-left text-sm whitespace-nowrap',
                    !fullScreen && 'w-full rounded-xl whitespace-normal',
                    selected
                      ? 'bg-primary-700 text-white'
                      : 'text-ink hover:bg-paper',
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {t(category.labelKey)}
                </button>
              );
            })}
          </nav>
          <DialogBody className="min-h-0 flex-1">
            {currentTab === 'template' ? (
              <TemplateSection
                columns={extrapolatedColumns}
                onChange={handleColumnsChanged}
              />
            ) : null}
            {currentTab === 'board' ? (
              <BoardSection
                owner={owner}
                options={settings}
                onChange={handleSettingsChange}
              />
            ) : null}
            {currentTab === 'posts' ? (
              <PostsSection
                options={settings.options}
                onChange={handleOptionsChange}
              />
            ) : null}
            {currentTab === 'voting' ? (
              <VotingSection
                options={settings.options}
                onChange={handleOptionsChange}
              />
            ) : null}
            {currentTab === 'timer' ? (
              <TimerSection
                options={settings.options}
                onChange={handleOptionsChange}
              />
            ) : null}
          </DialogBody>
        </div>
        <DialogFooter className="flex-wrap justify-between gap-3">
          <Checkbox
            checked={isDefaultTemplate}
            onCheckedChange={(checked) => {
              if (checked !== isDefaultTemplate) {
                toggleIsDefaultTemplate();
              }
            }}
            label={t('Customize.makeDefaultTemplate')}
          />
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              {t('Generic.cancel')}
            </Button>
            <Button onClick={handleCreate}>{t('Customize.editButton')}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SessionEditor;
