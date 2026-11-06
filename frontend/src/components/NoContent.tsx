interface NoContentProps {
  title: string;
  subtitle?: string;
}

const NoContent = ({ title, subtitle }: NoContentProps) => {
  return (
    <div className="my-12 flex w-full flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-light text-muted">{title}</h1>
      {subtitle ? (
        <h2 className="mt-2 text-base font-light text-muted">{subtitle}</h2>
      ) : null}
    </div>
  );
};

export default NoContent;
