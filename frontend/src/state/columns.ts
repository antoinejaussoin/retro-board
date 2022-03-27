import { ColumnDefinition, ColumnDefinitionType } from 'common';
import { Translation } from '../translations';
import { v4 } from 'uuid';
import keyBy from 'lodash/keyBy';
import { ColumnSettings, Template } from './types';
import { getTemplate } from './templates';
import isEqual from 'lodash/isEqual';

export function buildDefaults(
  template: Template,
  translations: Translation
): ColumnSettings[] {
  const base = getTemplate(template, translations);
  return base;
}

export function toColumnDefinitions(
  colDef: ColumnSettings[]
): ColumnDefinition[] {
  return colDef.map(
    (def, index) =>
      ({
        color: def.color,
        icon: def.icon,
        label: def.label,
        id: v4(),
        index,
        type: def.type,
      } as ColumnDefinition)
  );
}

export function extrapolate(
  colDef: ColumnSettings,
  translations: Translation
): ColumnSettings {
  const defaults = getTemplateColumnByType(translations);
  const defaultDef = defaults(colDef.type);
  return {
    color: colDef.color || defaultDef.color,
    label: colDef.label || defaultDef.label,
    icon: (colDef.icon as string | null) || defaultDef.icon,
    type: colDef.type,
  };
}

export function hasChanged(
  before: ColumnSettings[],
  after: ColumnSettings[],
  translations: Translation
) {
  const extrapolatedBefore = before.map((c) => extrapolate(c, translations));
  const extrapolatedAfter = after.map((c) => extrapolate(c, translations));
  return !isEqual(extrapolatedBefore, extrapolatedAfter);
}

export const getTemplateColumnByType =
  (translations: Translation) => (type: ColumnDefinitionType) => {
    const dic = keyBy(
      [
        {
          color: '#D1C4E9',
          icon: 'question',
          label: translations.PostBoard.customQuestion,
          type: 'custom',
        },
        {
          color: '#E8F5E9',
          icon: 'grinning',
          label: translations.PostBoard.wellQuestion,
          type: 'well',
        },
        {
          color: '#FFEBEE',
          icon: 'unamused',
          label: translations.PostBoard.notWellQuestion,
          type: 'notWell',
        },
        {
          color: '#FFFDE7',
          icon: 'sunny',
          label: translations.PostBoard.ideasQuestion,
          type: 'ideas',
        },
        {
          color: '#E8F5E9',
          icon: 'arrow_forward',
          label: translations.PostBoard.startQuestion,
          type: 'start',
        },
        {
          color: '#FFEBEE',
          icon: 'black_square_for_stop',
          label: translations.PostBoard.stopQuestion,
          type: 'stop',
        },
        {
          color: '#BBDEFB',
          icon: 'fast_forward',
          label: translations.PostBoard.continueQuestion,
          type: 'continue',
        },
        {
          color: '#E8F5E9',
          icon: 'thumbsup',
          label: translations.PostBoard.likedQuestion,
          type: 'liked',
        },
        {
          color: '#FFEBEE',
          icon: 'unamused',
          label: translations.PostBoard.learnedQuestion,
          type: 'learned',
        },
        {
          color: '#BBDEFB',
          icon: 'question',
          label: translations.PostBoard.lackedQuestion,
          type: 'lacked',
        },
        {
          color: '#E1BEE7',
          icon: 'desert_island',
          label: translations.PostBoard.longedForQuestion,
          type: 'longedFor',
        },
        {
          color: '#E8F5E9',
          icon: 'linked_paperclips',
          label: translations.PostBoard.anchorQuestion,
          type: 'anchor',
        },
        {
          color: '#FFEBEE',
          icon: 'motor_boat',
          label: translations.PostBoard.boatQuestion,
          type: 'cargo',
        },
        {
          color: '#BBDEFB',
          icon: 'desert_island',
          label: translations.PostBoard.islandQuestion,
          type: 'island',
        },
        {
          color: '#E1BEE7',
          icon: 'wind_blowing_face',
          label: translations.PostBoard.windQuestion,
          type: 'wind',
        },
        {
          color: '#FFE0B2',
          icon: 'moyai',
          label: translations.PostBoard.rockQuestion,
          type: 'rock',
        },
      ] as ColumnSettings[],
      (x) => x.type
    );
    return dic[type];
  };
