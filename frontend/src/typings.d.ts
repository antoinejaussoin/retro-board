declare module 'react-giphy-searchbox';
declare module '*.md';
declare module 'react-scroll-to-bottom';
declare const APP_VERSION: string;

declare namespace JSX {
  interface IntrinsicElements {
    'em-emoji': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        shortcodes?: string;
        id?: string;
        size?: string;
        skin?: string;
        set?: string;
      },
      HTMLElement
    >;
  }
}
