import { useState } from "react";
import {
  User,
  Bell,
  Palette,
  Shield,
  Database,
  LogOut,
  Trash2,
  Lock,
  Zap,
  Moon,
  Sun,
  Globe,
  Download,
  ChevronDown,
  type LucideIcon
} from "lucide-react";

// --- TYPES & INTERFACES ---

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface ToggleItemProps {
  title: string;
  desc: string;
  value: boolean;
  onChange: (val: boolean) => void;
  icon: React.ReactNode;
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  variant?: "default" | "danger";
  onClick?: () => void;
}

// --- SUB-COMPONENTS ---

function SessionItem({ device, location, current = false }: { device: string, location: string, current?: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--color-background)] border border-[var(--border)]">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-surface)] flex items-center justify-center border border-[var(--border)] text-[var(--color-text-secondary)]">
          {device.includes("iPhone") ? <Globe size={18} /> : <Database size={18} />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-black text-[var(--color-text-primary)]">{device}</p>
            {current && <span className="text-[8px] font-black uppercase text-[var(--color-primary)] tracking-widest">Active Now</span>}
          </div>
          <p className="text-[10px] font-medium text-[var(--color-text-secondary)] opacity-60">{location}</p>
        </div>
      </div>
      {!current && (
        <button type="button" className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] transition-colors">
          Revoke
        </button>
      )}
    </div>
  );
}

function ToggleItem({ title, desc, value, onChange, icon }: ToggleItemProps) {
  return (
    <div className="flex items-center justify-between p-8 hover:bg-[var(--color-background)] transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-background)] flex items-center justify-center border border-[var(--border)]">
          {icon}
        </div>
        <div>
          <p className="text-sm font-black text-[var(--color-text-primary)] tracking-tight">{title}</p>
          <p className="text-[10px] font-medium text-[var(--color-text-secondary)] opacity-70">{desc}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-14 h-8 rounded-full transition relative p-1 ${value ? "bg-[var(--color-primary)]" : "bg-[var(--border)]"}`}
      >
        <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300 ${value ? "translate-x-6" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

function ActionButton({ icon, label, variant = "default", onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all
      ${variant === "danger"
          ? "text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white"
          : "bg-[var(--color-background)] border border-[var(--border)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)]"
        }`}>
      {icon}
      {label}
    </button>
  );
}

// --- MAIN COMPONENT ---

export default function Settings() {
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [monthlyReport, setMonthlyReport] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs: Tab[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "financial", label: "Financial", icon: Database },
    { id: "notifications", label: "Alerts", icon: Bell },
    { id: "appearance", label: "Interface", icon: Palette },
    { id: "security", label: "Data & Security", icon: Shield },
  ];

  const activeTabData = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <div className="flex flex-col h-full md:h-[calc(100vh-100px)] mx-auto w-full overflow-hidden gap-6 md:gap-8 p-1">

      {/* 1. HEADER - Static and Pinned */}
      <div className="flex flex-col gap-2 shrink-0  bg-[var(--color-background)] z-20">
        <h2 className="text-3xl md:text-5xl font-black text-[var(--color-text-primary)] tracking-tighter">
          Settings
        </h2>
        <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.2em] opacity-60">
          Personalize your financial experience
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start flex-1 min-h-0">

        {/* 2. NAVIGATION - Sticky behavior */}
        <div className="w-full lg:w-64 shrink-0 z-[100] lg:sticky lg:top-0">

          {/* MOBILE DROPDOWN */}
          <div className="lg:hidden relative">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-[var(--color-surface)] border-2 border-[var(--color-primary)] text-[var(--color-text-primary)] shadow-xl"
            >
              <div className="flex items-center gap-3">
                <activeTabData.icon size={18} className="text-[var(--color-primary)]" />
                <span className="font-black text-xs uppercase tracking-widest">{activeTabData.label}</span>
              </div>
              <ChevronDown size={18} className={`transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMobileMenuOpen && (
              <>
                <div className="fixed inset-0 z-[-1] bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-[var(--color-surface)] border border-[var(--border)] rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full px-4 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all
                        ${activeTab === tab.id ? "bg-[var(--color-primary)] text-white shadow-lg" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-background)]"}`}
                    >
                      <tab.icon size={14} />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* DESKTOP SIDEBAR */}
          <div className="hidden lg:flex flex-col gap-2 w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all
                  ${activeTab === tab.id
                    ? "bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20 scale-[1.02]"
                    : "bg-[var(--color-surface)] border border-[var(--border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/40"
                  }`}
              >
                <tab.icon size={14} strokeWidth={activeTab === tab.id ? 3 : 2} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. RIGHT CONTENT - Independent Scroll */}
        <div className="flex-1 w-full h-full overflow-y-auto no-scrollbar pb-24">

          {/* PROFILE */}
          {activeTab === "profile" && (
            <div className="settings-section-animate space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-warm)] p-[2px]">
                  <div className="w-full h-full rounded-[1.9rem] bg-[var(--color-surface)] flex items-center justify-center text-2xl font-black text-[var(--color-text-primary)]">
                    RR
                  </div>
                </div>
                <button type="button" className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-[var(--border)] hover:bg-[var(--color-background)] transition-all">
                  Change Avatar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--color-surface)] border border-[var(--border)] p-8 rounded-[2.5rem] shadow-sm">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] px-2">Display Name</label>
                  <input type="text" defaultValue="Raktim Routh" className="settings-input" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] px-2">Email Address</label>
                  <input type="email" defaultValue="raktim@email.com" className="settings-input" />
                </div>
              </div>
            </div>
          )}

          {/* FINANCIAL */}
          {activeTab === "financial" && (
            <div className="settings-section-animate space-y-6 bg-[var(--color-surface)] border border-[var(--border)] p-8 rounded-[2.5rem] shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] px-2">Default Currency</label>
                  <select className="settings-input appearance-none">
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] px-2">Date Format</label>
                  <select className="settings-input">
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] px-2">Reporting Cycle</label>
                  <select className="settings-input">
                    <option>Starts on Monday</option>
                    <option>Starts on Sunday</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ALERTS */}
          {activeTab === "notifications" && (
            <div className="settings-section-animate space-y-4">
              <div className="bg-[var(--color-surface)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden">
                <ToggleItem
                  title="Budget Alerts"
                  desc="Critical push notifications when nearing limits"
                  value={budgetAlerts}
                  onChange={setBudgetAlerts}
                  icon={<Zap className="text-[var(--color-warm)]" size={18} />}
                />
                <div className="h-px bg-[var(--border)] mx-8 opacity-50" />
                <ToggleItem
                  title="Monthly Reports"
                  desc="Receive a detailed PDF summary every 30 days"
                  value={monthlyReport}
                  onChange={setMonthlyReport}
                  icon={<Database className="text-[var(--color-primary)]" size={18} />}
                />
              </div>
            </div>
          )}

          {/* APPEARANCE */}
          {activeTab === "appearance" && (
            <div className="settings-section-animate space-y-4">
              <div className="bg-[var(--color-surface)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden">
                <ToggleItem
                  title="Dark Mode"
                  desc="Switch between light and high-contrast dark theme"
                  value={darkMode}
                  onChange={setDarkMode}
                  icon={darkMode ? <Moon className="text-[var(--color-primary)]" size={18} /> : <Sun className="text-orange-400" size={18} />}
                />
                <div className="h-px bg-[var(--border)] mx-8 opacity-50" />
                <div className="flex items-center justify-between p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-background)] flex items-center justify-center border border-[var(--border)]">
                      <Globe className="text-[var(--color-accent)]" size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-[var(--color-text-primary)] tracking-tight">Sidebar Layout</p>
                      <p className="text-[10px] font-medium text-[var(--color-text-secondary)] opacity-70">Choose your preferred navigation style</p>
                    </div>
                  </div>
                  <select className="bg-[var(--color-background)] border border-[var(--border)] rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none">
                    <option>Expanded</option>
                    <option>Icons Only</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY & DATA */}
          {activeTab === "security" && (
            <div className="settings-section-animate space-y-8">
              <div className="bg-[var(--color-surface)] border border-[var(--border)] p-8 rounded-[2.5rem] shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-[var(--color-text-primary)] flex items-center gap-2">
                  <Lock size={16} /> Account Security
                </h3>
                <div className="flex flex-wrap gap-4">
                  <ActionButton icon={<Lock size={14} />} label="Change Password" />
                  <ActionButton icon={<Shield size={14} />} label="Two-Factor Auth" />
                  <ActionButton icon={<LogOut size={14} />} label="Logout this device" variant="danger" />
                </div>
              </div>

              <div className="bg-[var(--color-surface)] border border-[var(--border)] p-8 rounded-[2.5rem] shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-text-primary)]">Active Sessions</h3>
                  <span className="px-3 py-1 bg-[var(--color-success)]/10 text-[var(--color-success)] text-[9px] font-black rounded-full uppercase">3 Devices Online</span>
                </div>
                <div className="space-y-4">
                  <SessionItem device="iPhone 15 Pro" location="Tinsukia, Assam" current />
                  <SessionItem device="MacBook Air M2" location="Tinsukia, Assam" />
                  <SessionItem device="Chrome on Windows" location="Kolkata, WB" />
                </div>
                <button type="button" className="mt-6 text-[10px] font-black uppercase tracking-widest text-[var(--color-danger)] hover:opacity-70 transition-opacity">
                  Terminate all other sessions
                </button>
              </div>

              <div className="bg-[var(--color-surface)] border border-[var(--border)] p-8 rounded-[2.5rem] shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-[var(--color-text-primary)] flex items-center gap-2">
                  <Database size={16} /> Data & Privacy
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-[var(--color-background)] border border-[var(--border)] group hover:border-[var(--color-primary)] transition-all cursor-pointer">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Download size={20} />
                      </div>
                      <p className="text-sm font-black text-[var(--color-text-primary)]">Export Data</p>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed">Download a full archive of your transactions, accounts, and budgets in JSON or CSV format.</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-[var(--color-background)] border border-[var(--border)] group hover:border-[var(--color-danger)]/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                        <Trash2 size={20} />
                      </div>
                      <p className="text-sm font-black text-red-500">Delete Account</p>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed">Permanently erase your account and all associated financial data. This action is irreversible.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .settings-input {
          width: 100%;
          background: var(--color-background);
          border: 1px solid var(--border);
          border-radius: 1.25rem;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--color-text-primary);
          transition: all 0.2s;
          outline: none;
        }
        .settings-input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 4px var(--color-primary-soft);
        }
        .settings-section-animate {
          animation: slideUp 0.4s ease-out forwards;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}