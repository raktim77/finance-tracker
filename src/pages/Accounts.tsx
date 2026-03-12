import {
  Wallet,
  Landmark,
  CreditCard,
  Smartphone,
  Pencil,
  PlusCircle,
  ArrowUpRight,
  ChevronRight,
  type LucideIcon
} from "lucide-react";

// --- TYPES ---
interface Account {
  name: string;
  type: string;
  balance: string;
  icon: LucideIcon;
  color: string;
  lastUpdated: string;
}

const accounts: Account[] = [
  { name: "Cash", type: "Wallet", balance: "₹3,200", icon: Wallet, color: "#32a59e", lastUpdated: "Today" },
  { name: "SBI Bank", type: "Bank", balance: "₹45,000", icon: Landmark, color: "#4F46E5", lastUpdated: "2h ago" },
  { name: "UPI Wallet", type: "UPI", balance: "₹1,200", icon: Smartphone, color: "#16A34A", lastUpdated: "Today" },
  { name: "Credit Card", type: "Card", balance: "-₹8,000", icon: CreditCard, color: "#EF4444", lastUpdated: "Yesterday" }
];

export default function Accounts() {
  return (
    <div className="p-1 flex flex-col gap-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000 mx-auto w-full">

      {/* 1. HEADER SECTION */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl md:text-5xl font-black text-[var(--color-text-primary)] tracking-tighter">
            Accounts
          </h2>
          <div className="flex items-baseline gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[var(--color-success)]" />
            <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.2em] opacity-60">
              {accounts.length} ACTIVE ACCOUNTS
            </p>
          </div>
        </div>

        <button className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs md:text-sm transition-all active:scale-95 bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]/10 hover:bg-[var(--color-accent)] hover:text-white hover:shadow-[0_15px_30px_-10px_rgba(82,61,255,0.4)]">
          <PlusCircle size={18} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform" />
          <span className="hidden md:block text-sm">Add New Account</span>
          <span className="md:hidden text-sm">Add</span>
        </button>
      </div>

      {/* 2. PREMIUM TOTAL BALANCE CARD */}
      <div className="relative group overflow-hidden rounded-[2.5rem] p-8 md:p-12 bg-gradient-to-br from-[#7c6cff] via-[#9c7cff] to-[#c084fc] shadow-2xl/50 transition-all duration-500 hover:scale-[1.005]">
        {/* Animated Mesh Gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-[60px] -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/60">
              Total Balance
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-5xl font-black text-white tracking-tighter">
                ₹41,400
              </span>
              {/* <span className="text-sm font-bold text-white/50 lowercase">inr</span> */}
            </div>
          </div>

          <div className="flex items-center gap-4 bg-black/10 backdrop-blur-xl border border-white/10 p-4 rounded-[1.5rem] shadow-inner justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase text-white/50 tracking-widest">Growth</span>
              <span className="text-lg font-bold text-white leading-none">+12.4%</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowUpRight size={20} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. ACCOUNTS GRID: REFINED CARDS */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {accounts.map((acc, i) => {
          const Icon = acc.icon;
          const isNegative = acc.balance.startsWith("-");

          return (
            <div
              key={i}
              className="shadow-sm group relative flex flex-col justify-between rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] transition-all duration-300 hover:shadow-lg hover:cursor-pointer hover:border-[var(--color-accent)]/30  overflow-hidden"
            >
              {/* Background Glow on Hover */}
              <div className="absolute -top-10 -right-10 w-24 h-24 blur-3xl rounded-full opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" style={{ backgroundColor: acc.color }} />

              <div>
                <div className="flex justify-between items-start mb-6">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:-translate-y-1 group-hover:scale-105"
                    style={{ backgroundColor: `${acc.color}15`, color: acc.color }}
                  >
                    <Icon size={22} strokeWidth={2.5} />
                  </div>
                  <button className="p-2 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)] transition-colors">
                    <Pencil size={14} />
                  </button>
                </div>

                <div className="flex flex-col gap-1 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] opacity-60">
                    {acc.type} Account
                  </span>
                  <h3 className="font-black text-lg text-[var(--color-text-primary)] tracking-tight group-hover:text-[var(--color-accent)] transition-colors">
                    {acc.name}
                  </h3>
                </div>
              </div>

              <div>
                <h4 className={`text-2xl font-black tracking-tight mb-4 ${isNegative ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-primary)]'}`}>
                  {acc.balance}
                </h4>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] border-dashed">
                  <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-tighter">
                    Updated {acc.lastUpdated}
                  </span>
                  <div className="flex items-center gap-1 text-[var(--color-accent)] opacity-100 md:opacity-0 group-hover:opacity-100  transition-all -translate-x-2 group-hover:translate-x-0">
                    <span className="text-[9px] font-black uppercase">View</span>
                    <ChevronRight size={10} strokeWidth={3} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}