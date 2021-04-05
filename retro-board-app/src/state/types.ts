import { Session, IconName, ColumnDefinitionType } from '@retrospected/common';

export interface Action {
  type: string;
  payload?: any;
}

export interface State {
  session: Session | null;
}

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

export type Dispatch = (action: Action) => void;
