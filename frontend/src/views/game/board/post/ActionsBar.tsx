interface ActionsBarProps {
  color: string;
  rightActions: React.ReactNode;
}

const actionVisibility =
  'max-md:opacity-100 md:pointer-events-none md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100';

const ActionsBar = ({
  children,
  rightActions,
  color,
}: React.PropsWithChildren<ActionsBarProps>) => {
  return (
    <div
      className="flex items-center gap-1 border-t-2 px-1.5 py-1"
      style={{ borderTopColor: color }}
    >
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
