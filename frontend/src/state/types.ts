import type { ColumnDefinitionType } from 'common';
import type { Namespace, TFunction } from 'i18next';

export interface ColumnSettings {
  color: string;
  label: string;
  icon: string | null;
  type: ColumnDefinitionType;
}

export type Template =
  | 'default'
  | 'well-not-well'
  | 'well-not-well-ideas'
  | 'start-stop-continue'
  | 'four-l'
  | 'sailboat'
  | 'mad-sad-glad';

export interface TemplateDefinition {
  type: Template;
  name: string;
  icon: React.ReactNode;
}

export type TranslationFunction = TFunction<Namespace<'ns1'>, undefined>;
