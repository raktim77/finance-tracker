import { useContext, useEffect, useRef, useState } from "react";
import {
  User,
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
  type LucideIcon,
  LayoutList
} from "lucide-react";
import CropperModal from "../components/CropperModal";
import getCroppedImg from "../utils/cropImage";
import { useMe, useUpdateProfile } from "../features/user/hooks/useUsers";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";
import { useConfirm } from "../components/ui/confirm-modal/useConfirm";
import { useToast } from "../components/ui/confirm-modal/useToast";
import { ThemeContext } from "../context/ThemeContext";
import Dropdown from "../components/ui/Dropdown";
import { useAuth } from "../lib/context/useAuth";
import { useRevokeOtherSessions, useRevokeSession, useSessions } from "../features/session/hooks/useSession";

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

function SessionItem({
  device,
  location,
  current = false,
  onRevoke,
}: {
  device: string;
  location: string;
  current?: boolean;
  onRevoke?: () => void;
}) {
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
        <button
          type="button"
          onClick={onRevoke}
          className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] transition-colors"
        >
          Revoke
        </button>
      )}
    </div>
  );
}

function ToggleItem({ title, desc, value, onChange, icon }: ToggleItemProps) {
  return (
    <div className="flex items-center justify-between p-8 transition-colors">
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
  const [monthlyReport, setMonthlyReport] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [pendingAvatarImage, setPendingAvatarImage] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const updateProfileMutation = useUpdateProfile();
  const confirm = useConfirm();
  const toast = useToast();
  const { theme, setTheme, sidebarLayout, setSidebarLayout } = useContext(ThemeContext);
  const { logout } = useAuth();

  const tabs: Tab[] = [
    { id: "profile", label: "Profile", icon: User },
    // { id: "financial", label: "Financial", icon: Database },
    // { id: "notifications", label: "Alerts", icon: Bell },
    { id: "appearance", label: "Interface", icon: Palette },
    { id: "security", label: "Data & Security", icon: Shield },
  ];

  const activeTabData = tabs.find(t => t.id === activeTab) || tabs[0];
  const { data } = useMe();
  console.log(data);
  const initialDisplayName = data?.user?.name ?? "";
  const avatarUrl = data?.user?.profile?.avatar_url;
  const hasAvatar =
    typeof avatarUrl === "string"
      ? avatarUrl.trim() !== "" && avatarUrl.trim().toLowerCase() !== "null"
      : false;
  const isDisplayNameDirty = displayName.trim() !== initialDisplayName.trim();

  useEffect(() => {
    setDisplayName(initialDisplayName);
  }, [initialDisplayName]);

  const resetAvatarSelection = () => {
    setPendingAvatarImage(null);
    setCropModalOpen(false);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  };

  const handleDeleteAvatar = async () => {
    const ok = await confirm({
      title: "Delete Avatar?",
      message: "Your current avatar will be removed from your profile.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (!ok) return;

    try {
      setUploading(true);
      await updateProfileMutation.mutateAsync({
        avatar_url: null,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveDisplayName = async () => {
    if (!isDisplayNameDirty) return;

    try {
      setSavingName(true);
      await updateProfileMutation.mutateAsync({
        name: displayName.trim(),
      });
      toast.success("Profile updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setSavingName(false);
    }
  };

  const handleLogout = async () => {
    const ok = await confirm({
      title: "Logout?",
      message: "You will be signed out from this device.",
      confirmText: "Logout",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (!ok) return;

    try {
      await logout();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const { accessToken } = useAuth();

  const { data: sessionsData, isLoading: sessionsLoading } = useSessions({
    accessToken,
  });

  const revokeSessionMutation = useRevokeSession({ accessToken });
  const revokeOthersMutation = useRevokeOtherSessions({ accessToken });

  const sessions = sessionsData?.sessions || [];

  const handleRevokeSession = async (sessionId: string) => {
    const ok = await confirm({
      title: "Revoke Session?",
      message: "This device will be logged out.",
      confirmText: "Revoke",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (!ok) return;

    await revokeSessionMutation.mutateAsync(sessionId);
    toast.success("Session revoked");
  };

  return (


    <div className="flex flex-col h-full md:h-[calc(100vh-100px)] mx-auto w-full overflow-hidden gap-6 md:gap-8 p-1">
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        id="avatarInput"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setPendingAvatarImage(URL.createObjectURL(file));
          setCropModalOpen(true);
        }}
      />
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
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-warm)] p-[2px]">

                  <div className="w-full h-full rounded-full bg-[var(--color-surface)] flex items-center justify-center text-2xl font-black text-[var(--color-text-primary)]">
                    {hasAvatar ? (
                      <img
                        src={avatarUrl as string}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      "RR"
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-[var(--border)] hover:bg-[var(--color-background)] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {hasAvatar ? "Change Avatar" : "Add Avatar"}
                  </button>
                  {hasAvatar && (
                    <button
                      type="button"
                      aria-label="Delete avatar"
                      disabled={uploading}
                      onClick={handleDeleteAvatar}
                      className="p-2.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--color-surface)] border border-[var(--border)] p-8 rounded-[2.5rem] shadow-sm">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] px-2">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="settings-input"
                  />
                  <button
                    type="button"
                    onClick={handleSaveDisplayName}
                    disabled={!isDisplayNameDirty || savingName}
                    className="mt-3 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingName ? "Saving..." : "Save Changes"}
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] px-2">Email Address</label>
                  <input
                    type="text"
                    value={data?.user?.email}
                    readOnly
                    disabled
                    className="settings-input settings-input-disabled"
                  />
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
              <div className="bg-[var(--color-surface)] border border-[var(--border)] rounded-[2.5rem] overflow-visible">
                <ToggleItem
                  title="Dark Mode"
                  desc="Switch between light and high-contrast dark theme"
                  value={theme === "dark"}
                  onChange={(value) => setTheme(value ? "dark" : "light")}
                  icon={theme === "dark" ? <Moon className="text-[var(--color-primary)]" size={18} /> : <Sun className="text-orange-400" size={18} />}
                />
                <div className="h-px bg-[var(--border)] mx-8 opacity-50" />
                <div className="flex items-center justify-between p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-background)] flex items-center justify-center border border-[var(--border)]">
                      <Globe className="text-[var(--color-accent)]" size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-[var(--color-text-primary)] tracking-tight">Sidebar Layout</p>
                      <p className="text-[10px] font-medium text-[var(--color-text-secondary)] opacity-70">Choose your preferred navigation style and keep it synced across the app</p>
                    </div>
                  </div>
                  <div className="w-full md:w-[180px]">
                    <Dropdown
                      icon={LayoutList}
                      value={sidebarLayout}
                      onChange={(value) => setSidebarLayout(value as "expanded" | "icons")}
                      options={[
                        { label: "Expanded", value: "expanded" },
                        { label: "Icons Only", value: "icons" },
                      ]}
                    />
                  </div>
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
                  {data?.user?.oauth_providers.length == 0 && (<ActionButton icon={<Lock size={14} />} label="Change Password" />
                  )}
                  {/* <ActionButton icon={<Shield size={14} />} label="Two-Factor Auth" /> */}
                  <ActionButton icon={<LogOut size={14} />} label="Logout this device" variant="danger" onClick={handleLogout} />
                </div>
              </div>

              <div className="bg-[var(--color-surface)] border border-[var(--border)] p-8 rounded-[2.5rem] shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-text-primary)]">Active Sessions</h3>
                  <span className="px-3 py-1 bg-[var(--color-success)]/10 text-[var(--color-success)] text-[9px] font-black rounded-full uppercase">{sessions.length} {sessions.length > 1 ? "Devices" : "Device"} Online</span>
                </div>
                <div className="space-y-4">
                  {sessionsLoading && (
                    <p className="text-xs text-[var(--color-text-secondary)]">Loading sessions...</p>
                  )}

                  {!sessionsLoading && sessions.length === 0 && (
                    <p className="text-xs text-[var(--color-text-secondary)]">No active sessions</p>
                  )}

                  {sessions.map((s) => (
                    <div key={s._id}>
                      <SessionItem
                        device={s.device}
                        location={s.location || "Approximate location"}
                        current={s.current}
                        onRevoke={
                          s.current ? undefined : () => void handleRevokeSession(s._id)
                        }
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    const ok = await confirm({
                      title: "Terminate Other Sessions?",
                      message: "All other devices will be logged out.",
                      confirmText: "Terminate",
                      cancelText: "Cancel",
                      variant: "danger",
                    });

                    if (!ok) return;

                    await revokeOthersMutation.mutateAsync();
                    toast.success("Other sessions terminated");
                  }}
                  className="mt-6 text-[10px] font-black uppercase tracking-widest text-[var(--color-danger)] hover:opacity-70 transition-opacity"
                >
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
        .settings-input:disabled,
        .settings-input-disabled {
          background: color-mix(in srgb, var(--color-background) 85%, #9ca3af 15%);
          color: color-mix(in srgb, var(--color-text-secondary) 85%, #ffffff 15%);
          border-color: color-mix(in srgb, var(--border) 70%, #9ca3af 30%);
          cursor: not-allowed;
          opacity: 0.8;
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
      {cropModalOpen && pendingAvatarImage && (
        <CropperModal
          image={pendingAvatarImage}
          isSaving={uploading}
          onClose={resetAvatarSelection}
          onSave={async (croppedAreaPixels) => {
            if (!pendingAvatarImage) return;

            try {
              setUploading(true);

              // 1. crop → blob
              const blob = await getCroppedImg(pendingAvatarImage, croppedAreaPixels);

              // 2. upload to cloudinary
              const url = await uploadToCloudinary(blob);

              // 3. call mutation (IMPORTANT)
              await updateProfileMutation.mutateAsync({
                avatar_url: url,
              });

              resetAvatarSelection();
            } catch (err) {
              console.error(err);
            } finally {
              setUploading(false);
            }
          }}
        />
      )}
    </div>

  );


}
