import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import RcDrawer from 'rc-drawer';
import motionProps from './motion';
import 'rc-drawer/assets/index.css';

type DrawerProps = {
  className?: string;
  closeButton?: React.ReactNode;
  width?: string;
  placement: 'left' | 'right' | 'top' | 'bottom';
  drawerHandler: React.ReactNode;
  children: React.ReactNode;
  closeButtonStyle?: React.CSSProperties;
  toggleHandler: () => void;
  open: boolean;
  level?: any;
  handler?: boolean;
};

const Drawer = ({
  className,
  children,
  closeButton,
  closeButtonStyle,
  drawerHandler,
  toggleHandler,
  placement,
  open,
  width = '300px',
  handler = false,
  level = null,
  ...props
}: DrawerProps) => {
  // Add all classs to an array
  const addAllClasses = ['reusecore__drawer'];
  // const addAllClasses = ['rc-drawer-content-wrapper'];

  // className prop checking
  if (className) {
    addAllClasses.push(className);
  }

  return (
    <Fragment>
      <RcDrawer
        open={open}
        onClose={toggleHandler}
        className={addAllClasses.join(' ')}
        width={width}
        placement={placement}
        {...props} // Motion
        {...motionProps}
      >
        <div
          className="reusecore-drawer__close"
          onClick={toggleHandler}
          style={closeButtonStyle}
          role="button"
          tabIndex={0}
        >
          {closeButton}
        </div>
        {children}
      </RcDrawer>

      <div
        className="reusecore-drawer__handler"
        style={{ display: 'inline-block' }}
        onClick={toggleHandler}
        role="button"
        tabIndex={0}
      >
        {drawerHandler}
      </div>
    </Fragment>
  );
};

export default Drawer;
