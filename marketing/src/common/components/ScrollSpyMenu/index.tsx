import React, { useContext } from 'react';
import Scrollspy from 'react-scrollspy';
import AnchorLink from 'react-anchor-link-smooth-scroll';

import { DrawerContext } from '../../contexts/DrawerContext';
import NextImage from '../NextImage';
import { MenuItem } from '@/types';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';

type ScrollSpyMenuProps = {
  /** className of the ScrollSpyMenu. */
  className?: string;

  /** menuItems is an array of object prop which contain your menu
   * data.
   */
  menuItems: MenuItem[];

  /** Class name that apply to the navigation element paired with the content element in viewport. */
  currentClassName?: string;

  /** Class name that apply to the navigation elements that have been scrolled past [optional]. */
  scrolledPastClassName?: string;

  /** HTML tag for Scrollspy component if you want to use other than <ul/> [optional]. */
  componentTag?: string;

  /** Style attribute to be passed to the generated <ul/> element [optional]. */
  style?: React.CSSProperties;

  /** Offset value that adjusts to determine the elements are in the viewport [optional]. */
  offset?: number;

  /** Name of the element of scrollable container that can be used with querySelector [optional]. */
  rootEl?: string;

  drawer?: boolean;

  /**
   * Function to be executed when the active item has been updated [optional].
   */
  onUpdate?: ((item: HTMLElement) => void) | undefined;
};

const RenderLinkWithIcon = ({ menu }: { menu: MenuItem }) => {
  return (
    <div className="icon-login">
      {menu.icon ? (
        <NextImage className="icon" src={menu.icon} alt={menu.label} />
      ) : (
        ''
      )}
      <a
        className={menu.icon ? 'icon-label' : 'no-icon-label'}
        href={menu.path}
      >
        {menu.label}
      </a>
    </div>
  );
};

const ScrollSpyMenu = ({
  className,
  menuItems,
  drawer,
  componentTag = 'ul',
  currentClassName = 'is-current',
  ...props
}: ScrollSpyMenuProps) => {
  const { t } = useTranslation();
  const { dispatch } = useContext(DrawerContext);
  // empty array for scrollspy items
  const scrollItems: string[] = [];

  // convert menu path to scrollspy items
  menuItems.forEach((item) => {
    scrollItems.push(item.path.slice(1));
  });

  // Add all classs to an array
  const addAllClasses = ['scrollspy__menu'];

  // className prop checking
  if (className) {
    addAllClasses.push(className);
  }

  // Close drawer when click on menu item
  const toggleDrawer = () => {
    dispatch({
      type: 'TOGGLE',
    });
  };

  return (
    <Scrollspy
      items={scrollItems}
      className={addAllClasses.join(' ')}
      currentClassName={currentClassName}
      componentTag={componentTag}
      {...props}
    >
      {menuItems.map((menu, index) => {
        const isAnchor = menu.path.startsWith('#');
        return (
          <li key={`menu-item-${index}`}>
            {menu.staticLink ? (
              <RenderLinkWithIcon menu={menu} />
            ) : (
              <>
                {drawer ? (
                  <AnchorLink
                    href={menu.path}
                    offset={menu.offset}
                    onClick={toggleDrawer}
                  >
                    {t(menu.label)}
                  </AnchorLink>
                ) : (
                  <>
                    {isAnchor ? (
                      <AnchorLink href={menu.path} offset={menu.offset}>
                        {t(menu.label)}
                      </AnchorLink>
                    ) : (
                      <Link href={menu.path}>{t(menu.label)}</Link>
                    )}
                  </>
                )}
              </>
            )}
          </li>
        );
      })}
    </Scrollspy>
  );
};

export default ScrollSpyMenu;
