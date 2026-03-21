import 'react';

declare module 'react' {
  namespace JSX {
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
}
