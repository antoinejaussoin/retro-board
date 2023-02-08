import React from 'react';
import ReactDOM from 'react-dom';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import RangeBox from './index';
import { string } from 'postcss-selector-parser';

describe('<RangeBox /> Component', () => {
  // const minProps = {
  //   type: 'range',
  //   min: 'a',
  //   max: 1,
  //   stepper: 1
  // };
  // it('renders without crashing', () => {
  //   expect(shallow(<RangeBox {...minProps} />).length).toEqual(1);
  // });
  it('renders without crashing', () => {
    shallow(<RangeBox />);
  });
});
