interface ActionsBarProps {
  left: React.ReactNode;
  rightActions: React.ReactNode;
}

const actionVisibility =
  'max-md:opacity-100 md:pointer-events-none md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100';

const ActionsBar = ({ left, rightActions }: ActionsBarProps) => {
  return (
    <div className="retro-post-actions flex w-full flex-wrap items-center gap-x-1 gap-y-1 border-t border-line px-1.5 py-1">
      <div className="flex min-w-0 max-w-full flex-[1_1_8rem] flex-wrap items-center gap-1">
        {left}
      </div>
      <div
        className={`ml-auto flex shrink-0 items-center transition-opacity ${actionVisibility}`}
      >
        {rightActions}
      </div>
    </div>
  );
};

export default ActionsBar;
