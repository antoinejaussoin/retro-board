interface ActionsBarProps {
  center?: React.ReactNode;
  rightActions: React.ReactNode;
}

const actionVisibility =
  'max-md:opacity-100 md:pointer-events-none md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100';

const ActionsBar = ({
  children,
  center,
  rightActions,
}: React.PropsWithChildren<ActionsBarProps>) => {
  return (
    <div className="retro-post-actions grid grid-cols-[1fr_auto_1fr] items-center gap-1 border-t border-line px-1.5 py-1">
      <div className="flex min-w-0 items-center">{children}</div>
      <div className="flex max-w-full flex-wrap items-center justify-center gap-1">
        {center}
      </div>
      <div
        className={`flex items-center justify-end transition-opacity ${actionVisibility}`}
      >
        {rightActions}
      </div>
    </div>
  );
};

export default ActionsBar;
