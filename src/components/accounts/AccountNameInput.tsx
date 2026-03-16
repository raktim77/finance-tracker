import { Wallet } from "lucide-react";

export default function AccountNameInput({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-[10px] font-black uppercase text-[var(--color-text-secondary)] tracking-[0.2em] opacity-50 ml-1">Display Name</label>
      <div className="flex items-center gap-4 px-5 py-4 bg-[var(--color-background)] rounded-[1.25rem] border border-[var(--border)] focus-within:border-[var(--color-accent)] transition-all">
        <Wallet size={18} className="text-[var(--color-accent)] opacity-40" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. HDFC Salary"
          className="bg-transparent outline-none w-full font-bold text-sm text-[var(--color-text-primary)] placeholder:opacity-50"
        />
      </div>
    </div>
  );
}