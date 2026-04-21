import { Plus } from "lucide-react";
import { useHeaderContext } from "../../context/HeaderContext";
import Logo from "../../assets/images/only_logo.png";
import "./AppHeader.css";

export function AppHeader() {
  const { state } = useHeaderContext();
  const {
    backgroundColor,
    textColor,
    showShadow,
    titleVisible,
    actionVisible,
    actionLabel,
    onAction,
    logoVisible,
    title,
  } = state;

  return (
    <header
      className="app-header"
      style={{
        backgroundColor,
        boxShadow: showShadow ? "0 1px 0 rgba(0,0,0,0.09)" : "none",
        color: textColor,
      }}
    >
      <div className="app-header__status-bar" />

      <nav className="app-header__nav-bar" aria-label="Mobile page header">
        <span
          className={`app-header__logo ${
            logoVisible ? "app-header__logo--visible" : ""
          }`}
          aria-hidden={!logoVisible}
        >
          <img src={Logo} alt="Xpensio" className="app-header__logo-image" />
        </span>

        <span
          className={`app-header__title ${
            titleVisible ? "app-header__title--visible" : ""
          }`}
          aria-hidden={!titleVisible}
        >
          {title}
        </span>

        {actionLabel && (
          <button
            type="button"
            className={`app-header__action ${
              actionVisible ? "app-header__action--visible" : ""
            }`}
            style={{ color: textColor, borderColor: `${textColor}33` }}
            onClick={onAction ?? undefined}
            aria-label={actionLabel === "+" ? "Add transaction" : actionLabel}
            aria-hidden={!actionVisible}
            tabIndex={actionVisible ? 0 : -1}
          >
            {actionLabel === "+" ? <Plus size={20} strokeWidth={3} /> : actionLabel}
          </button>
        )}
      </nav>
    </header>
  );
}
