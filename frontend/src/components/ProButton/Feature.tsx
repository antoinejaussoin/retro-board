interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  color: string;
  description: string;
}

function Feature({ icon, title, color, description }: FeatureProps) {
  return (
    <div className="flex overflow-hidden rounded-2xl border border-line bg-cream">
      <div
        className="flex items-center justify-center px-5"
        style={{ color }}
      >
        {icon}
      </div>
      <div className="px-2 py-4">
        <div className="text-xl font-light">{title}</div>
        <div className="mt-1 max-w-lg text-sm leading-6 text-muted">
          {description}
        </div>
      </div>
    </div>
  );
}

export default Feature;
