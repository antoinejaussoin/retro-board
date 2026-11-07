import NewTag from './NewTag';
import Tag from './Tag';

type TagInputProps = {
  values: string[];
  placeholder?: string;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  onValidate?: (value: string) => Promise<boolean>;
};

async function noop() {
  return true;
}

export default function TagInput({
  values,
  placeholder,
  onAdd,
  onRemove,
  onValidate,
}: TagInputProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {values.map((v, i) => (
        <Tag key={i} value={v} onDelete={onRemove} />
      ))}
      <NewTag
        onAdd={onAdd}
        onValidate={onValidate || noop}
        placeholder={placeholder}
      />
    </div>
  );
}
