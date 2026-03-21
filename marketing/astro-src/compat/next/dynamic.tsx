import React, { useEffect, useState } from 'react';

export default function dynamic<TProps extends object>(
  loader: () => Promise<React.ComponentType<TProps>> | Promise<{ default: React.ComponentType<TProps> }> | React.ComponentType<TProps>,
) {
  return function DynamicComponent(props: TProps) {
    const [Component, setComponent] = useState<React.ComponentType<TProps> | null>(null);

    useEffect(() => {
      Promise.resolve(loader()).then((resolved) => {
        if (typeof resolved === 'function') {
          setComponent(() => resolved);
          return;
        }

        setComponent(() => resolved.default);
      });
    }, []);

    if (!Component) {
      return null;
    }

    return React.createElement(Component, props);
  };
}