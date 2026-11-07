interface ActionsBarProps {
  rightActions: React.ReactNode;
}

const actionVisibility =
  'max-md:opacity-100 md:pointer-events-none md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100';

const ActionsBar = ({
  children,
  rightActions,
}: React.PropsWithChildren<ActionsBarProps>) => {
  return (
    <div className="retro-post-actions flex items-center gap-1 border-t border-line px-1.5 py-1">
      <div className="flex min-w-0 flex-1 items-center">{children}</div>
      <div
        className={`flex items-center transition-opacity ${actionVisibility}`}
      >
        {rightActions}
      </div>
    </div>
  );
};

export default ActionsBar;
