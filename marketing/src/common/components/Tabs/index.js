import React, { useState } from 'react';
import PropTypes from 'prop-types';
import TabWrapper, {
  TabMenu,
  MenuItem,
  TabContent,
  TabPanel,
} from './tabs.style';

const Tab = ({ active, className, children }) => {
  const [state, setState] = useState({
    active: active || 0,
  });

  const handleChange = (index) => {
    setState({ active: index });
  };

  const addAllClasses = ['rq_tab'];
  if (className) {
    addAllClasses.push(className);
  }

  return (
    <TabWrapper className={addAllClasses.join(' ')}>
      <TabMenu className="tab_menu">
        {children.map((element, index) => {
          let activeClass = index === state.active ? 'active' : '';
          return (
            <MenuItem
              key={index}
              className={activeClass}
              onClick={() => handleChange(index)}
            >
              {element.props.title}
            </MenuItem>
          );
        })}
      </TabMenu>
      <TabContent className="tab_content">{children[state.active]}</TabContent>
    </TabWrapper>
  );
};

export const Panel = ({ children }) => (
  <TabPanel className="tab_panel">{children}</TabPanel>
);

Tab.propTypes = {
  children: PropTypes.array,
  active: PropTypes.number.isRequired,
};

Panel.propTypes = {
  children: PropTypes.element,
  title: PropTypes.element.isRequired,
};

export default Tab;
