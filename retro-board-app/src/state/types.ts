import { IconName, ColumnDefinitionType } from '@retrospected/common';

export interface ColumnSettings {
  color: string;
  label: string;
  icon: IconName | null;
  type: ColumnDefinitionType;
}

export type Template =
  | 'default'
  | 'well-not-well'
  | 'start-stop-continue'
  | 'four-l'
  | 'sailboat';

export interface TemplateDefinition {
  type: Template;
  name: string;
}
