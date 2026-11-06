import 'flag-icons/css/flag-icons.min.css';

type FlagProps = {
  country: string;
};

export function Flag({ country }: FlagProps) {
  return (
    <span className="relative mr-2 ml-1 inline-block h-6 w-8 overflow-hidden rounded-sm text-2xl leading-none">
      <span className={`fi fi-${country} block h-6 w-8`} />
    </span>
  );
}
