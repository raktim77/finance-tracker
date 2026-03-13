type Props = {
value: string;
onChange: (value: string) => void;
};

export default function NoteInput({ value, onChange }: Props) {
return ( <div className="space-y-2"> <label className="text-sm text-[var(--color-text-secondary)]">
Note </label>


  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder="Add a note..."
    rows={2}
    className="
      w-full
      resize-none
      rounded-xl
      border border-[var(--border)]
      bg-[var(--color-surface)]
      px-3 py-2
      text-sm
      outline-none
      focus:border-[var(--color-accent)]
    "
  />
</div>


);
}
