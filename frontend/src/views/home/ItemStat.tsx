interface ItemStatProps {
  value: number;
  label: string;
  color: string;
}

const ItemStat = ({ value, label, color }: ItemStatProps) => {
  return (
    <div className="flex flex-col items-center px-1 py-2 text-center">
      <div className="text-lg font-medium tabular-nums" style={{ color }}>
        {value}
      </div>
      <div className="text-[11px] leading-4 text-muted">{label}</div>
    </div>
  );
};

export default ItemStat;
