declare module '*.md';
declare module 'react-scroll-to-bottom';
declare const APP_VERSION: string;

// @types/react 19 keeps JSX on the React namespace. Code and react-markdown 8
// still refer to the global JSX namespace.
declare namespace JSX {
  type Element = React.JSX.Element;
  type ElementClass = React.JSX.ElementClass;
  type IntrinsicElements = React.JSX.IntrinsicElements;
}

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
