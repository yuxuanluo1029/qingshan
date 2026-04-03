import type * as React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        poster?: string;
        alt?: string;
        ar?: boolean | string;
        'ar-modes'?: string;
        'camera-controls'?: boolean | string;
        'auto-rotate'?: boolean | string;
        exposure?: string;
        'shadow-intensity'?: string;
        'environment-image'?: string;
        'interaction-prompt'?: string;
        loading?: 'auto' | 'eager' | 'lazy';
      };
    }
  }
}

export {};
