declare module 'react-giphy-searchbox';
declare module '*.md';
declare module 'react-scroll-to-bottom';
declare const APP_VERSION: string;

declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      'em-emoji': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        id?: string;
        shortcodes?: string;
        native?: string;
        size?: string | number;
        set?: string;
        skin?: string | number;
      };
    }
  }
}
