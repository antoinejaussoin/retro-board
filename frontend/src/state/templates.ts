import { Translation } from '../translations';
import { Template, ColumnSettings, TemplateDefinition } from './types';
import { getTemplateColumnByType } from './columns';

export function getAllTemplates(
  translations: Translation
): TemplateDefinition[] {
  return [
    {
      type: 'default',
      name: translations.Template.default!,
    },
    {
      type: 'well-not-well',
      name: translations.Template.wellNotWell!,
    },
    {
      type: 'start-stop-continue',
      name: translations.Template.startStopContinue!,
    },
    { type: 'four-l', name: translations.Template.fourLs! },
    { type: 'sailboat', name: translations.Template.sailboat! },
  ];
}

export function getTemplate(
  template: Template,
  translations: Translation
): ColumnSettings[] {
  const dic = getTemplateColumnByType(translations);
  switch (template) {
    case 'default':
      return [dic('well'), dic('notWell'), dic('ideas')];
    case 'well-not-well':
      return [dic('well'), dic('notWell')];
    case 'start-stop-continue':
      return [dic('start'), dic('stop'), dic('continue')];
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
