import React from 'react';
import { render } from '../../../testing';
import SummaryModeSwitch from '../SummaryModeSwitch';

describe('SummaryModeSwitch', () => {
  it('Should toggle the mode when clicked', () => {
    const { getByLabelText } = render(<SummaryModeSwitch />);
    const checkbox = getByLabelText(/summary mode/i) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    checkbox.click();
    expect(checkbox.checked).toBe(true);
  });
});
