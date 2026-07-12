import type { ColumnDefinition, ColumnDefinitionType } from 'common';
import isEqual from 'lodash/isEqual';
import keyBy from 'lodash/keyBy';
import { v4 } from 'uuid';
import { getTemplateColumns } from './templates';
import type { ColumnSettings, Template, TranslationFunction } from './types';

export function buildDefaults(
  template: Template,
  translations: TranslationFunction,
): ColumnSettings[] {
  const base = getTemplateColumns(template, translations);
  return base;
}

export function toColumnDefinitions(
  colDef: ColumnSettings[],
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
      }) as ColumnDefinition,
  );
}

export function extrapolate(
  colDef: ColumnSettings,
  translations: TranslationFunction,
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
  translations: TranslationFunction,
) {
  const extrapolatedBefore = before.map((c) => extrapolate(c, translations));
  const extrapolatedAfter = after.map((c) => extrapolate(c, translations));
  return !isEqual(extrapolatedBefore, extrapolatedAfter);
}

export const getTemplateColumnByType =
  (t: TranslationFunction) => (type: ColumnDefinitionType) => {
    const dic = keyBy(
      [
        {
          color: '#D1C4E9',
          icon: 'question',
          label: t('PostBoard.customQuestion'),
          type: 'custom',
        },
        {
          color: '#E8F5E9',
          icon: 'grinning',
          label: t('PostBoard.wellQuestion'),
          type: 'well',
        },
        {
          color: '#FFEBEE',
          icon: 'unamused',
          label: t('PostBoard.notWellQuestion'),
          type: 'notWell',
        },
        {
          color: '#FFFDE7',
          icon: 'sunny',
          label: t('PostBoard.ideasQuestion'),
          type: 'ideas',
        },
        {
          color: '#E8F5E9',
          icon: 'arrow_forward',
          label: t('PostBoard.startQuestion'),
          type: 'start',
        },
        {
          color: '#FFEBEE',
          icon: 'black_square_for_stop',
          label: t('PostBoard.stopQuestion'),
          type: 'stop',
        },
        {
          color: '#BBDEFB',
          icon: 'fast_forward',
          label: t('PostBoard.continueQuestion'),
          type: 'continue',
        },
        {
          color: '#E8F5E9',
          icon: 'thumbsup',
          label: t('PostBoard.likedQuestion'),
          type: 'liked',
        },
        {
          color: '#FFEBEE',
          icon: 'mortar_board',
          label: t('PostBoard.learnedQuestion'),
          type: 'learned',
        },
        {
          color: '#BBDEFB',
          icon: 'question',
          label: t('PostBoard.lackedQuestion'),
          type: 'lacked',
        },
        {
          color: '#E1BEE7',
          icon: 'desert_island',
          label: t('PostBoard.longedForQuestion'),
          type: 'longedFor',
        },
        {
          color: '#E8F5E9',
          icon: 'linked_paperclips',
          label: t('PostBoard.anchorQuestion'),
          type: 'anchor',
        },
        {
          color: '#FFEBEE',
          icon: 'motor_boat',
          label: t('PostBoard.boatQuestion'),
          type: 'cargo',
        },
        {
          color: '#BBDEFB',
          icon: 'desert_island',
          label: t('PostBoard.islandQuestion'),
          type: 'island',
        },
        {
          color: '#E1BEE7',
          icon: 'wind_blowing_face',
          label: t('PostBoard.windQuestion'),
          type: 'wind',
        },
        {
          color: '#FFE0B2',
          icon: 'moyai',
          label: t('PostBoard.rockQuestion'),
          type: 'rock',
        },
        {
          color: '#FFCDD2',
          icon: 'rage',
          label: t('PostBoard.madQuestion'),
          type: 'mad',
        },
        {
          color: '#FFECB3',
          icon: 'disappointed',
          label: t('PostBoard.sadQuestion'),
          type: 'sad',
        },
        {
          color: '#C8E6C9',
          icon: 'blush',
          label: t('PostBoard.gladQuestion'),
          type: 'glad',
        },
      ] as ColumnSettings[],
      (x) => x.type,
    );
    return dic[type];
  };
