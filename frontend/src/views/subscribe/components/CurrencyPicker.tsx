import noop from 'lodash/noop';
import { Currency } from 'common';
import 'flag-icons/css/flag-icons.min.css';
import { currencies } from './types';
import { cn } from 'ui/cn';

interface CurrencyPickerProps {
  value: Currency;
  disabled: boolean;
  onChange: (value: Currency) => void;
}

function CurrencyPicker({ value, disabled, onChange }: CurrencyPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {currencies.map((currency) => {
        const selected = currency.value === value;
        return (
          <button
            key={currency.value}
            type="button"
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => (!disabled ? onChange(currency.value) : noop())}
            className={cn(
              'flex flex-col items-center rounded-xl border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-60',
              selected ? 'border-primary-600' : 'border-transparent',
            )}
          >
            <span
              className={`fi fi-${currency.iso} relative text-[32px]`}
            >
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/50 to-transparent" />
            </span>
            <span className="mt-0.5 text-[0.7em] text-muted">
              {currency.value.toUpperCase()}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default CurrencyPicker;
