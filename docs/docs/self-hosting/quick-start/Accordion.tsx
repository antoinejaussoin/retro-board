import React, { PropsWithChildren, useState } from 'react';
import styles from './Accordion.module.css';

type AccordionProps = {
  title: string;
};

export function Accordion({
  title,
  children,
}: PropsWithChildren<AccordionProps>) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.container} onClick={() => setOpen((p) => !p)}>
      <div className={styles.title}>
        {title} {!open ? <>(click to open)</> : null}
      </div>
      {open ? <div className={styles.content}>{children}</div> : null}
    </div>
  );
}
