import {
  Template,
  ColumnSettings,
  TemplateDefinition,
  TranslationFunction,
} from './types';
import { getTemplateColumnByType } from './columns';
import { Bookmark } from 'lucide-react';

export function getAllTemplates(t: TranslationFunction): TemplateDefinition[] {
  return [
    {
      type: 'default',
      name: t('Template.default')!,
      icon: <Bookmark />,
    },
    {
      type: 'well-not-well-ideas',
      name: t('Template.wellNotWellIdeas')!,
      icon: <Bookmark />,
    },
    {
      type: 'well-not-well',
      name: t('Template.wellNotWell')!,
      icon: <Bookmark />,
    },
    {
      type: 'mad-sad-glad',
      name: t('Template.madSadGlad')!,
      icon: <Bookmark />,
    },
    {
      type: 'start-stop-continue',
      name: t('Template.startStopContinue')!,
      icon: <Bookmark />,
    },
    { type: 'four-l', name: t('Template.fourLs')!, icon: <Bookmark /> },
    { type: 'sailboat', name: t('Template.sailboat')!, icon: <Bookmark /> },
  ];
}

export function getTemplateColumns(
  template: Template,
  translations: TranslationFunction
): ColumnSettings[] {
  const dic = getTemplateColumnByType(translations);
  switch (template) {
    case 'default':
      return [dic('well'), dic('notWell'), dic('ideas')];
    case 'well-not-well-ideas':
      return [dic('well'), dic('notWell'), dic('ideas')];
    case 'well-not-well':
      return [dic('well'), dic('notWell')];
    case 'start-stop-continue':
      return [dic('start'), dic('stop'), dic('continue')];
    case 'mad-sad-glad':
      return [dic('mad'), dic('sad'), dic('glad')];
    case 'four-l':
      return [dic('liked'), dic('learned'), dic('lacked'), dic('longedFor')];
    case 'sailboat':
      return [
        dic('anchor'),
        dic('cargo'),
        dic('island'),
        dic('wind'),
        dic('rock'),
      ];
    default:
      return [dic('well'), dic('notWell'), dic('ideas')];
  }
}
