import styled from 'styled-components';
import { themeGet } from 'styled-system';
import { base } from '../base';
// import ThemedStyleSheet from 'react-with-styles/lib/ThemedStyleSheet';
// import aphroditeInterface from 'react-with-styles-interface-aphrodite';
// import DefaultTheme from 'rheostat/lib/themes/DefaultTheme';

// ThemedStyleSheet.registerInterface(aphroditeInterface);
// ThemedStyleSheet.registerTheme(DefaultTheme);

const RangeBoxStyle = styled.div``;

// prop types can also be added from the style functions
RangeBoxStyle.propTypes = {};

RangeBoxStyle.displayName = 'RangeBoxStyle';

RangeBoxStyle.defaultProps = {
  as: 'div',
};

export default RangeBoxStyle;
