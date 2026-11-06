import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from './cn';

export function Slider({
  min,
  max,
  value,
  onChange,
  marks,
  className,
}: {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  marks?: { value: number; label: string }[];
  className?: string;
}) {
  return (
    <div className={cn('px-1 pt-2', className)}>
      <SliderPrimitive.Root
        min={min}
        max={max}
        step={1}
        value={[value]}
        onValueChange={([next]) => {
          if (next !== undefined) {
            onChange(next);
          }
        }}
        className="relative flex h-5 w-full touch-none items-center select-none"
      >
        <SliderPrimitive.Track className="relative h-1.5 grow rounded-full bg-line">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-primary-600" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block size-4 rounded-full border-2 border-primary-700 bg-cream shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500" />
      </SliderPrimitive.Root>
      {marks && marks.length <= 16 ? (
        <div className="mt-2 flex justify-between text-[10px] text-muted">
          {marks.map((mark) => (
            <span key={mark.value}>{mark.label}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
