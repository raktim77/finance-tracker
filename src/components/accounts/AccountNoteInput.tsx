import { FileText } from "lucide-react";

export default function AccountNoteInput({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-[10px] font-black uppercase text-[var(--color-text-secondary)] tracking-[0.2em] opacity-50 ml-1">Optional Note</label>
      <div className="flex items-start gap-4 px-5 py-4 bg-[var(--color-background)] rounded-[1.25rem] border border-[var(--border)] focus-within:border-[var(--color-accent)] transition-all">
        <FileText size={18} className="text-[var(--color-accent)] opacity-40 " />
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Add details..."
          rows={2}
          className="bg-transparent outline-none w-full font-medium text-sm text-[var(--color-text-primary)] placeholder:opacity-50 resize-none"
        />
      </div>
    </div>
  );
}