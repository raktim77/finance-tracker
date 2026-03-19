type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function NoteInput({ value, onChange }: Props) {
  const MAX_CHARS = 80; // Suggested limit

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)] opacity-50">
          Note
        </label>
        {/* Character Counter */}
        <span className={`text-[9px] font-bold tracking-widest uppercase transition-opacity ${
          value.length >= MAX_CHARS ? "text-[var(--color-danger)]" : "opacity-30"
        }`}>
          {value.length} / {MAX_CHARS}
        </span>
      </div>

      <div
        className="
          rounded-[1.25rem]
          border border-[var(--border)]
          bg-[var(--color-background)]
          px-5 py-4
          transition-all duration-300
          hover:border-[var(--color-accent)]/30
          focus-within:border-[var(--color-accent)]/40
        "
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
          maxLength={MAX_CHARS}
          placeholder="Add a note..."
          rows={3}
          className="
            w-full resize-none bg-transparent outline-none
            text-sm font-medium text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-secondary)] placeholder:opacity-50
          "
        />
      </div>
    </div>
  );
}