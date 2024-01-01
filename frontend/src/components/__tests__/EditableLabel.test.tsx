import { vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import EditableLabel from '../EditableLabel';
import { describe, expect, it } from 'vitest';

describe('EditableLabel', () => {
  it('Should display the value by default', () => {
    const onChangeHandler = vi.fn();
    const { getByLabelText } = render(
      <EditableLabel value="Foo" onChange={onChangeHandler} label="Example" />
    );
    const display = getByLabelText(/example/i);
    expect(display.innerHTML).toBe('Foo');
    expect(onChangeHandler).not.toHaveBeenCalled();
  });

  it('Should turn into a textbox and allow me to type on click', () => {
    const onChangeHandler = vi.fn();
    const { container, getByLabelText } = render(
      <EditableLabel value="Foo" onChange={onChangeHandler} label="Example" />
    );
    const display = getByLabelText(/example/i);
    fireEvent.click(display);
    display.click();
    const input = getByLabelText(/input/);
    if (!input) {
      throw new Error('It should display a display text');
    }
    fireEvent.change(input, { target: { value: 'Bar' } });
    fireEvent.keyPress(input, { keyCode: 13 });
    expect(container.querySelector('textarea')).toBeNull();
    expect(onChangeHandler).toHaveBeenCalledTimes(1);
    expect(onChangeHandler).toHaveBeenCalledWith('Bar');
  });
});
